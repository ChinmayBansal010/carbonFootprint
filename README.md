# C-FootPrinter: Carbon Footprint Tracker


C-FootPrinter is a web application designed to help users track and manage their personal carbon footprint. By logging daily activities related to transportation, energy consumption, diet, and purchases, users can gain insights into their environmental impact and discover ways to live more sustainably. The application also includes gamification elements like badges to encourage and reward eco-friendly habits.

---

## ✨ Features

-   **User Authentication**: Secure sign-up and login functionality.
-   **Carbon Footprint Calculator**: Log activities across various categories (transport, energy, food, etc.).
-   **Interactive Dashboard**: Visualize your carbon footprint data with charts and graphs.
-   **Eco-Badges**: Earn badges for achieving sustainability milestones (e.g., "Energy Saver," "Eco Commuter").
-   **Educational Content**: Learn about your environmental impact and get tips for reduction.
-   **Responsive Design**: Fully functional on both desktop and mobile devices.

---

## 🛠️ Tech Stack

### Backend
-   **Framework**: Flask
-   **Database**: Supabase (PostgreSQL)
-   **Deployment**: Procfile for Heroku-like services

### Frontend
-   **Library**: React.js
-   **Build Tool**: Vite
-   **Styling**: CSS
-   **State Management**: React Hooks (`useState`, `useEffect`)
-   **Routing**: React Router
-   **HTTP Client**: Fetch API

---

## 📁 Project Structure

```
C-FootPrinter/
├── Backend/
│   ├── Procfile
│   ├── requirements.txt
│   ├── runtime.txt
│   └── src/
│       └── components/
│           ├── aliases.json
│           ├── app.py
│           └── badges/
│               ├── Below Global Average.png
│               ├── Eco Commuter.png
│               └── ... (other badges)
├── Frontend/
│   ├── public/
│   │   └── ... (static assets)
│   ├── src/
│   │   ├── assets/
│   │   │   └── ... (images, icons)
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── CFTracker.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Navbar.jsx
│   │   ├── app.jsx
│   │   ├── main.jsx
│   │   ├── supabaseClient.js
│   │   └── ... (other pages and helpers)
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ... (other config files)
└── .gitignore
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Python 3.8+ and pip
-   Node.js and npm (or yarn)
-   Git

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ChinmayBansal010/C-FootPrinter.git
    cd C-FootPrinter
    ```

2.  **Set up the Backend:**
    ```sh
    cd Backend
    # Create a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt
    ```
    You will also need to create a `.env` file in the `Backend/src` directory to store your Supabase credentials:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    ```

3.  **Set up the Frontend:**
    ```sh
    cd ../Frontend

    # Install dependencies
    npm install
    ```
    Create a `.env.local` file in the `Frontend` directory with your Supabase credentials for the client-side:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Running the Application

1.  **Start the Backend Server:**
    -   Make sure you are in the `Backend` directory with your virtual environment activated.
    ```sh
    flask run
    ```
    The backend server will start on `http://127.0.0.1:5000`.

2.  **Start the Frontend Development Server:**
    -   Open a new terminal, navigate to the `Frontend` directory.
    ```sh
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).

---

## Usage

Once both the backend and frontend servers are running, you can open your browser and navigate to the frontend URL. From there you can:
1.  **Sign up** for a new account.
2.  **Log in** to your existing account.
3.  Navigate to the **Tracker** page to log your activities.
4.  Visit your **Dashboard** to see your carbon footprint analysis and earned badges.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
