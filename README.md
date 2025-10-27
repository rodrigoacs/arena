# Arena - Tournament Manager

<p align="center">
  <img src="src/assets/logo.png" alt="Arena Logo" width="150">
</p>

<p align="center">
  A modern, responsive web tournament manager focused on multiplayer formats like Commander (Magic: The Gathering).
</p>

<p align="center">
  Organize your events, add players, generate rounds with Swiss pairing, and track the leaderboard in real time.
</p>

## 🚀 Features

* **Player Management:** Easily add and remove players.
* **Swiss Pairing:** Generates random pairings (round 1) and score-based pairings for subsequent rounds.
* **Multiplayer Tables:** Optimized for 4-player tables (Commander default), with intelligent distribution for extra players.
* **Result Recording:** Record each player's placement (1st, 2nd, 3rd, 4th) at each table.
* **Scoring System:** Standard points system (3 pts / 2 pts / 1 pt for 1st/2nd/3rd place).
* **Tiebreakers:** Robust ranking with multiple criteria (Points > 1st Places > 2nd Places > 3rd Places > Average Placement).
* **Real-Time Leaderboard:** Rankings update instantly in a side panel.
* **Data Persistence:** Tournament state is saved to the browser's `localStorage`. Don’t lose progress when reloading the page!
* **Responsive Design:** Works well on desktops and mobile devices.

## 🛠️ Technologies Used

* **Frontend:** [Vue 3](https://vuejs.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Routing:** [Vue Router](https://router.vuejs.org/)
* **UI:** [PrimeVue](https://primevue.org/) 
* **Deploy:** [Docker](https://www.docker.com/) / [Nginx](https://www.nginx.com/)

## 🏁 Running the Project Locally

### Prerequisites
* Node.js (v20+ recommended)
* npm

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/arena.git
    cd arena
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```

### Development (Hot Reload)

To start the development server (usually at `http://localhost:5173`):
```sh
npm run dev
```

### Production Build

To compile and minify for production:

```sh
npm run build
```

Static files will be generated in the `dist/` directory.

## 🐳 Deploy with Docker

The project includes a multi-stage `Dockerfile` for an optimized build and a `docker-compose.yml` to simplify deployment.

### 1. Build the Image

To build the Docker image for the frontend:

```sh
docker build -t arena-frontend .
```

### 2. Using Docker Compose

The `docker-compose.yml` is configured to use an external network called `proxy` (common in setups with Traefik or Nginx Proxy Manager).

If you use a `proxy` network:

```sh
docker-compose up -d
```

If you just want to run locally (e.g., on port 8080):

1.  Create a `docker-compose.override.yml` file at the project root:
    ```yml
    version: '3.8'

    services:
      app:
        networks:
          - default # Remove the external 'proxy' network
        ports:
          - "8080:80" # Map the container's port 80 to host port 8080

    networks:
      proxy:
        driver: none # Disable the external network
      default:
        driver: bridge
    ```
2.  Start the container:
    ```sh
    docker-compose up -d
    ```
3.  The app will be available at `http://localhost:8080`.

## 📄 License

This project is open source. Feel free to use and modify it.