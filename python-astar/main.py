from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
import cv2
import uvicorn
import math
import heapq
import base64
import requests

# SCHEMA
class NavRequest(BaseModel):
    image_url: str
    phone_width: int
    phone_height: int
    start: list[int]   # [x, y]
    end: list[int]     # [x, y]



# IMAGE PROCESSING

def image_process(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones((3, 3), np.uint8)
    walls = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    return (walls > 0).astype(np.uint8)



# DRAW PATH ON IMAGE

def draw_path(img, path, start, end):
    out = img.copy()
    for i in range(len(path) - 1):
        cv2.line(out, tuple(path[i]), tuple(path[i + 1]), (0, 255, 136), 2)
    for pt in path[1:-1]:
        cv2.circle(out, tuple(pt), 5, (0, 191, 255), -1)
        cv2.circle(out, tuple(pt), 5, (255, 255, 255), 1)
    cv2.circle(out, tuple(start), 9, (0, 255, 136), -1)   # green = start
    cv2.circle(out, tuple(start), 9, (255, 255, 255), 2)
    cv2.circle(out, tuple(end),   9, (255, 60,  80),  -1) # red = end
    cv2.circle(out, tuple(end),   9, (255, 255, 255), 2)
    return out



# ASTAR

class Astar:
    def __init__(self, grid, dist_transform, start, goal):
        self.grid = grid
        self.dist_transform = dist_transform
        self.start = (start[1], start[0])  # (row, col)
        self.goal = (goal[1], goal[0])

    def heuristic(self, a, b):
        return math.hypot(a[0] - b[0], a[1] - b[1])

    
    # LINE OF SIGHT CHECK
    
    def check_line(self, p1, p2):
        y1, x1 = p1
        y2, x2 = p2
        steps = max(abs(y2 - y1), abs(x2 - x1))
        if steps == 0:
            return True

        for i in range(1, steps + 1):
            ny = int(y1 + i * (y2 - y1) / steps)
            nx = int(x1 + i * (x2 - x1) / steps)
            if self.grid[ny, nx] != 0:
                return False
            # Keep line-of-sight slightly away from walls to prevent corner cutting
            if self.dist_transform[ny, nx] < 8:
                return False
        return True

    
    # REMOVE EXTRA POINTS (KEEP ONLY TURNS)
    
    def remove_collinear(self, path):
        if len(path) < 3:
            return path

        cleaned = [path[0]]

        for i in range(1, len(path) - 1):
            p0 = cleaned[-1]
            p1 = path[i]
            p2 = path[i + 1]

            v1 = (p1[0] - p0[0], p1[1] - p0[1])
            v2 = (p2[0] - p1[0], p2[1] - p1[1])

            # cross product = 0 → same direction → skip
            if v1[0] * v2[1] - v1[1] * v2[0] != 0:
                cleaned.append(p1)

        cleaned.append(path[-1])
        return cleaned

    
    # LINE-OF-SIGHT SMOOTHING (THETA*)
    
    def smooth_path(self, path):
        if len(path) < 3:
            return path

        smoothed = [path[0]]
        i = 0

        while i < len(path) - 1:
            # Try to reach as far ahead as possible with clear line of sight
            j = len(path) - 1
            while j > i + 1:
                if self.check_line(path[i], path[j]):
                    break
                j -= 1
            smoothed.append(path[j])
            i = j

        return smoothed

    
    # ASTAR SEARCH
    
    def find_path(self):
        rows, cols = self.grid.shape
        pq = [(0, self.start, (0, 0))]
        g = {self.start: 0}
        came = {}

        dirs = [
            (-1, 0), (1, 0), (0, -1), (0, 1),
            (-1, -1), (-1, 1), (1, -1), (1, 1)
        ]

        while pq:
            _, cur, prev = heapq.heappop(pq)

            if cur == self.goal:
                path = []
                while cur in came:
                    path.append(cur)
                    cur = came[cur]
                path.append(self.start)
                path.reverse()

                # 🔥 FINAL CLEAN
                path = self.remove_collinear(path)
                path = self.smooth_path(path)  # ← Theta* line-of-sight smoothing

                # convert back to (x, y)
                return [(p[1], p[0]) for p in path]

            for dy, dx in dirs:
                ny, nx = cur[0] + dy, cur[1] + dx
                if not (0 <= ny < rows and 0 <= nx < cols):
                    continue
                if self.grid[ny, nx] != 0:
                    continue

                cost = math.hypot(dy, dx)
                if prev != (0, 0) and prev != (dy, dx):
                    cost += 0.5

                # Keep away from walls by penalizing low distance values
                dist = self.dist_transform[ny, nx]
                if dist > 0:
                    penalty = 200.0 / (dist + 0.1)
                else:
                    penalty = 2000.0
                cost += penalty

                ng = g[cur] + cost
                nxt = (ny, nx)

                if nxt not in g or ng < g[nxt]:
                    g[nxt] = ng
                    came[nxt] = cur
                    f = ng + self.heuristic(nxt, self.goal)
                    heapq.heappush(pq, (f, nxt, (dy, dx)))

        return None


# APP + CORS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.ngrok(-free)?\.app",
    allow_credentials=False,      
    allow_methods=["*"],
    allow_headers=["*"],
)



# ENDPOINT

@app.post("/navigate")
def navigate(req: NavRequest):

    # 1. Load image from URL
    try:
        resp = requests.get(req.image_url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        return JSONResponse({"error": f"Failed to fetch image: {e}"}, status_code=400)

    img = cv2.imdecode(np.frombuffer(resp.content, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return JSONResponse({"error": "Could not decode image"}, status_code=400)

    # 2. Resize to phone resolution
    phone_img = cv2.resize(img, (req.phone_width, req.phone_height), interpolation=cv2.INTER_AREA)

    # 3. Build obstacle map
    obstacle_map = image_process(phone_img)

    # Calculate distance transform to keep path centered
    free_space = (obstacle_map == 0).astype(np.uint8)
    dist_transform = cv2.distanceTransform(free_space, cv2.DIST_L2, 5)

    # 4. Bounds + obstacle check
    sx, sy = req.start
    ex, ey = req.end

    if not (0 <= sx < req.phone_width and 0 <= sy < req.phone_height):
        return JSONResponse({"error": "Start out of bounds"}, status_code=400)
    if not (0 <= ex < req.phone_width and 0 <= ey < req.phone_height):
        return JSONResponse({"error": "End out of bounds"}, status_code=400)
    if obstacle_map[sy, sx] != 0:
        return JSONResponse({"error": "Start is inside an obstacle"}, status_code=400)
    if obstacle_map[ey, ex] != 0:
        return JSONResponse({"error": "End is inside an obstacle"}, status_code=400)

    # 5. Run A*
    path = Astar(obstacle_map, dist_transform, req.start, req.end).find_path()
    if not path:
        return JSONResponse({"error": "No path found"}, status_code=404)

    # 6. Draw path on the resized (phone-size) image
    annotated = draw_path(phone_img, path, req.start, req.end)

    # 7. Encode annotated image → base64 data URL
    _, buf = cv2.imencode(".png", annotated)
    b64    = base64.b64encode(buf).decode("utf-8")
    data_url = f"data:image/png;base64,{b64}"

    # 8. Return proper JSON via JSONResponse
    return JSONResponse(content={
        "phone_resolution": [req.phone_width, req.phone_height],
        "start":            req.start,
        "end":              req.end,
        "turning_points":   path,           # [[x1,y1],[x2,y2],...]
        "image_base64":     data_url,       # data:image/png;base64
    })

if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)