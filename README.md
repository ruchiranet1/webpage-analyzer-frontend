# 🌍 Web Page Analyzer Frontend

This is a web application that provides a user interface for analyzing web pages. It securely communicates with the dedicated **Web Page Analyzer Service (Backend)** to perform a detailed, synchronous analysis of a given URL.

---

## ✨ Features

* **Secure API Proxying:** Uses a web API route (`/api/analyze`) to securely pass the URL and necessary credentials (like the `AUTH_TOKEN`) to the backend service.
* **Synchronous Analysis:** Designed to wait for and immediately display the final analysis results (HTML version, title, headings, links, login form presence).
* **Idempotency Key:** Implements a client-side mechanism to generate and utilize an `Idempotency-Key` to prevent the accidental duplication of analysis requests to the backend within a 30-second window.
* **Rich UI Display:** Presents the analysis results using clear tables, charts, and status indicators built with React and Tailwind CSS.
* **Robust Error Handling:** Provides clear messages for API failures and configuration errors.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Backend Communication:** Next.js API Routes (Route Handlers)

---

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following in place:

1.  **Node.js** (version 18 or higher) and **npm** or **yarn**.
2.  The **Web Page Analyzer Service (Backend)** must be running and accessible at the URL defined in your configuration (default: `http://localhost:8080`).

    * **Setup & Run Backend:** Clone the backend repository and start the service on port `8080` as per its instructions:

        ```bash
        git clone https://github.com/ruchiranet1/webpage-analyzer-service.git
        # Follow the instructions in the backend's README to run the service (e.g., 'make run').
        ```

    > **Required Backend Endpoint:** This frontend application is configured to call the **Synchronous Analysis** endpoint: `POST /api/v1/analyzes`.

### 1. Configuration

The application requires credentials to authenticate with the backend service. Create a file named **`.env.local`** in the root of the project to store environment-specific variables. The server needs the `EMAIL` and `AUTH_TOKEN` for secure communication.

| Variable | Description | Example Value | Visibility |
| :--- | :--- | :--- | :--- |
| `API_URL` | The base URL of your backend API. | `http://localhost:8080` | **Client & Server** |
| `AUTH_TOKEN` | The JWT used in the `Authorization` header. | `myuser1` | **Server Only** |

***Example `.env.local` contents:***

```text
API_URL=http://localhost:8080
AUTH_TOKEN=myuser1
```

### 2. Installation and Running
Install dependencies and start the Next.js development server:


```bash
# Install dependencies
npm install
# Run the server
npm run dev
```

The application will be accessible at http://localhost:3000.


### 3 Deployment (Docker)

This application uses a multi-stage Docker build based on **Node 20-alpine** for efficient production deployment.

#### Building and Running the Container

1.  **Build the image:**
    ```bash
    docker build -t webpage-analyzer-frontend .
    ```

2.  **Run the container:**
    *The server-side code requires the credentials from `.env.local` at runtime.*
    ```bash
    docker run -d -p 3000:3000 --env-file .env.local webpage-analyzer-frontend
    ```

The frontend will be available at `http://localhost:3000`.

