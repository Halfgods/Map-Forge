import cv2
import numpy as np
import heapq
import imutils
import math

# =========================
# IMAGE PROCESSING
# =========================
def image_process(img):
    h, w = img.shape[:2]

    resized = imutils.resize(img, width=600)
    scale_x = w / resized.shape[1]
    scale_y = h / resized.shape[0]
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    kernel = np.ones((5, 5), np.uint8)
    walls = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

    obstacle_map = (walls > 0).astype(np.uint8)
    cv2.imwrite("obstacle_map.png", obstacle_map*255)  # for debugging
    return obstacle_map, scale_x, scale_y


# =========================
# ASTAR
# =========================
class Astar:
    def __init__(self, grid, dist_transform, start, goal):
        self.grid = grid
        self.dist_transform = dist_transform
        self.start = (start[1], start[0])  # (row, col)
        self.goal = (goal[1], goal[0])

    def heuristic(self, a, b):
        return math.hypot(a[0] - b[0], a[1] - b[1])

    # ----------------------------------
    # LINE OF SIGHT CHECK
    # ----------------------------------
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

    # ----------------------------------
    # REMOVE EXTRA POINTS (KEEP ONLY TURNS)
    # ----------------------------------
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

    # ----------------------------------
    # LINE-OF-SIGHT SMOOTHING (THETA*)
    # ----------------------------------
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

    # ----------------------------------
    # ASTAR SEARCH
    # ----------------------------------
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

# =========================
# CLICK HANDLER
# =========================
points = []
img_display = None

def click_event(event, x, y, flags, param):
    global points
    if event == cv2.EVENT_LBUTTONDOWN:
        points.append((x, y))
        print(f"Clicked: {(x,y)}")
        cv2.circle(img_display, (x,y), 5, (0,0,255), -1)
        cv2.imshow("Map", img_display)

        if len(points) == 2:
            start, goal = points

            # scale down for grid
            s = (int(start[0]/sx), int(start[1]/sy))
            g = (int(goal[0]/sx), int(goal[1]/sy))

            astar = Astar(grid, dist_transform, s, g)
            path = astar.find_path()

            if not path:
                print("No path found")
                return

            # scale path back up
            path = [(int(px*sx), int(py*sy)) for px,py in path]

            print("\nTurns:")
            for p in path:
                print(p)

            for i in range(len(path)-1):
                cv2.line(img_display, path[i], path[i+1], (255,0,0), 2)

            # Draw intermediate points (between start and end) in yellow
            for p in path[1:-1]:
                cv2.circle(img_display, p, 5, (0, 255, 255), -1)

            cv2.imshow("Map", img_display)


# =========================
# MAIN
# =========================
img = cv2.imread("Floor_6.png")
img = imutils.resize(img, width=600)
img_display = img.copy()

grid, sx, sy = image_process(img)
grid = cv2.dilate(grid, np.ones((5,5),np.uint8), 1)

free_space = (grid == 0).astype(np.uint8)
dist_transform = cv2.distanceTransform(free_space, cv2.DIST_L2, 5)

cv2.imshow("Map", img_display)
cv2.setMouseCallback("Map", click_event)
print("Click START then GOAL")
cv2.waitKey(0)
cv2.destroyAllWindows()
print(img.shape)