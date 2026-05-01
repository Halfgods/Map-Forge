# Map-Forge (ARNavic)

Map-Forge is a comprehensive web application designed for Augmented Reality (AR) based indoor navigation. It allows users to upload building blueprints, scan QR codes to load specific maps, and navigate from one point to another using real-time pathfinding visualized in an AR environment.

The project is structured into three main components: a React Frontend, a Node.js Express Backend, and a Python-based FastAPI service for A* pathfinding.

## 📂 Project Structure

```text
Map-Forge/
│
├── Frontend/                 # React application (Vite)
│   ├── src/
│   │   ├── Components/       # React components (ARScene, Auth, Home, QrScan, Upload, etc.)
│   │   ├── Redux/            # State management (Redux Toolkit)
│   │   ├── Assets/           # Images, icons, and 3D models
│   │   ├── CSS/ & SCSS/      # Styling
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx           # Main App component (wraps ARScene)
│   │   └── main.jsx          # Entry point and React Router configuration
│   ├── package.json
│   └── index.html
│
├── Node-Backend/             # Node.js + Express Backend
│   ├── config/               # Database configuration (PostgreSQL)
│   ├── controllers/          # Request handlers (auth, buildings)
│   ├── middleware/           # Custom middlewares (e.g., JWT auth)
│   ├── routes/               # API route definitions
│   ├── index.js              # Server entry point
│   └── package.json
│
└── python-astar/             # Python Pathfinding Microservice (FastAPI)
    ├── main.py               # FastAPI server and endpoint definitions
    ├── astar.py              # A* algorithm implementation and OpenCV image processing
    └── pyproject.toml
```

## 🛣️ Routes & API Endpoints

### Frontend Routes (React Router)
- `/` - **Home Page** (`Homes.jsx`)
- `/login` - **User Login** (`Login.jsx`)
- `/signup` - **User Registration** (`Signup.jsx`)
- `/upload` - **Upload Building Maps** (`Upload.jsx`)
- `/all-map` - **View All Maps** (`AllMap.jsx`)
- `/qr` - **QR Code Scanner** (`QrScan.jsx`)
- `/map` - **AR Navigation View** (`App.jsx` -> `ARScene.jsx`)
- `/*` - **404 Not Found** (`Error.jsx`)

### Node.js Backend API
- **Auth Routes (`/api/auth`)**
  - `POST /signup` - Register a new user.
  - `POST /login` - Authenticate a user and return a token.
- **Building Routes (`/api/buildings`)**
  - `POST /upload` - Upload a new building (blueprint, panorama, details). Requires authentication (Multer is used for file uploads).
  - `GET /my-buildings` - Retrieve a list of buildings uploaded by the authenticated user.
- **Public Building Route (`/api`)**
  - `GET /building/:id` - Fetch details (blueprint, metadata) for a specific building by its ID.

### Python Pathfinding API
- **Navigation Route**
  - `POST /navigate` - Accepts a JSON payload (`image_url`, `phone_width`, `phone_height`, `start`, `end`). It downloads the blueprint, processes it to identify obstacles, calculates the shortest A* path, and returns the path coordinates along with a base64 encoded annotated image.

## ⚙️ How It Works

1. **Authentication & Map Management:** 
   Users can sign up, log in, and upload maps of their buildings. When uploading, they provide a blueprint image, a panorama, and other details. This data is stored via the Node.js backend into a PostgreSQL database.
   
2. **Accessing a Map:** 
   A user can access a specific building's map by scanning a QR code on the `/qr` page. This triggers a request to the Node backend (`/api/building/:id`) to retrieve the map data (blueprint, panorama, coordinates).

3. **Pathfinding & Image Processing (Python Microservice):**
   When a user selects a start and end destination on the map, the frontend sends a request to the Python FastAPI microservice (`/navigate`). 
   - The Python server fetches the blueprint image using the provided URL.
   - It uses **OpenCV** to process the image, detect walls, and create a binary obstacle map.
   - A custom **A* Pathfinding algorithm** (optimized with Theta* line-of-sight smoothing) calculates the most efficient route avoiding obstacles.
   - The calculated path points (turning points) and a visual representation of the path drawn on the map are returned to the frontend.

4. **AR Navigation:**
   The frontend receives the path coordinates from the Python backend. The `ARScene` component then dynamically renders this path, overlaying it on the real world using Augmented Reality techniques (likely utilizing WebXR or a similar AR library), guiding the user step-by-step to their destination.
