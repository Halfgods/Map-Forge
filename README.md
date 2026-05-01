<div align="center">
  <img src="Frontend/src/Assets/Logo.png" alt="Map-Forge Logo" width="150"/>
  <h1>Map-Forge (ARNavic)</h1>
  <p><strong>A Next-Generation Augmented Reality Indoor Navigation System</strong></p>

  [![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#frontend-react-application)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js_&_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#node-backend-express-api)
  [![FastAPI](https://img.shields.io/badge/Microservice-FastAPI_&_Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#python-astar-pathfinding-microservice)
  [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](#tech-stack)
</div>

<br/>

> **Map-Forge** is a comprehensive web application designed for Augmented Reality (AR) based indoor navigation. It solves the problem of unreliable indoor GPS by allowing users to upload building blueprints, scan QR codes to localize themselves, and navigate seamlessly using real-time A* pathfinding visualized in an AR environment.

---

## How We Solved It

Indoor navigation is notoriously difficult because standard GPS signals fail inside buildings. We solved this by creating a three-tier architecture that blends modern web technologies, robust image processing, and advanced algorithms:

1. **Map Digitization**: Facility managers upload building blueprints and 360° panoramas via our intuitive React dashboard. The Node.js backend processes these assets, storing them securely in Cloudinary and PostgreSQL.
2. **QR-Based Localization**: To establish a user's starting point without GPS, we generate location-specific QR codes. Users simply scan a QR code upon entering a building to load the exact floor plan and their current position.
3. **Intelligent Pathfinding**: When a user selects a destination, our Python microservice uses **OpenCV** to dynamically convert the uploaded blueprint into a traversable grid, identifying walls and obstacles. It then runs a highly optimized **A\* Pathfinding Algorithm** (enhanced with Theta* line-of-sight smoothing) to calculate the shortest, safest route.
4. **AR Navigation**: The computed path coordinates are sent back to the React frontend, which overlays the path dynamically onto the user's screen, guiding them step-by-step.

---

## Tech Stack

### Frontend (React Application)
The user interface is built for speed, interactivity, and mobile-first AR navigation.
* **Core**: React 19 (Vite), React Router for seamless navigation.
* **State Management**: Redux Toolkit for predictable state transitions.
* **Styling & UI**: Material UI (MUI), SCSS/Sass, Framer Motion for smooth animations.
* **Features**: `html5-qrcode` for scanning, `pannellum` for 360° views, `react-zoom-pan-pinch` for map interactivity.

### Node-Backend (Express API)
A robust RESTful API handling authentication, database management, and file storage.
* **Core**: Node.js, Express.js.
* **Database**: PostgreSQL (via `pg`), structured for complex relational data.
* **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs` for secure password hashing.
* **Storage**: Cloudinary for fast image delivery, `multer` for multipart form parsing.

### Python-Astar (Pathfinding Microservice)
A dedicated, high-performance service specifically designed for image processing and complex routing calculations.
* **Core**: FastAPI for lightning-fast API responses.
* **Computer Vision**: OpenCV (`opencv-contrib-python`) & `imutils` for blueprint analysis and wall detection.
* **Mathematics**: NumPy for efficient grid array manipulations.

---

## System Architecture & Routing

### Frontend Routes (React Router)
The frontend handles the client-side experience and AR visualization.
* `/` - **Home Page**: Landing dashboard.
* `/login` & `/signup` - **Authentication**: Secure user onboarding.
* `/upload` - **Upload Building Maps**: Dashboard for managers to add blueprints and panoramas.
* `/all-map` - **View All Maps**: Browse available building configurations.
* `/qr` - **QR Code Scanner**: Instantly load a map based on a physical QR code.
* `/map` - **AR Navigation View**: The core AR scene rendering the A* path over the real world.

### Node.js Backend API
Acts as the central nervous system, managing data persistence and user sessions.
* **Auth Routes (`/api/auth`)**
  * `POST /signup` - Registers a new facility manager/user.
  * `POST /login` - Authenticates credentials and issues a JWT.
* **Building Routes (`/api/buildings`)**
  * `POST /upload` - Uploads blueprint images to Cloudinary and saves metadata to PostgreSQL (Requires Auth).
  * `GET /my-buildings` - Retrieves buildings specific to the logged-in user.
* **Public Route (`/api`)**
  * `GET /building/:id` - Fetches building details, blueprint URLs, and metadata for a scanned QR code.

### Python Pathfinding API
A stateless microservice dedicated to heavy computational tasks.
* **Navigation Route (`/navigate`)**
  * `POST /navigate`
  * **Payload**: `{ "image_url": "...", "phone_width": 1080, "phone_height": 1920, "start": [x, y], "end": [x, y] }`
  * **What it does**: 
    1. Downloads the blueprint from the provided `image_url`.
    2. Runs OpenCV edge detection to identify walls and generate a collision matrix.
    3. Executes the A* algorithm to find the optimal path from `start` to `end`.
    4. Returns a JSON array of `(x, y)` path coordinates and a Base64 encoded image showing the drawn path for debugging/verification.

---

## Repository Structure

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
---

## Final Product Demonstration

Watch the system in action, demonstrating the seamless flow from scanning a QR code to following an AR-guided path:

https://github.com/user-attachments/assets/dcf9f008-6cb0-4dbc-a9e7-76da92102702

<div align="center">
  <i>Built by Map-Forge Team Shreyas , Bhavesh , Justin</i>
</div>
