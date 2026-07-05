# Phone App (E-commerce Application)

A modern, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). The application provides a robust backend API and a responsive, interactive frontend featuring Tailwind CSS for styling and Recharts for data visualization.

## 🚀 Key Features

### Frontend (Client Application)
- **Modern UI/UX:** Responsive design using Tailwind CSS with visually appealing components and animations.
- **Authentication:** JWT-based login, registration, and Google OAuth integration.
- **Data Visualization:** Interactive charts using Recharts for analytics and manager dashboards.
- **State Management & Routing:** Handled via React Hooks and React Router DOM.
- **Toast Notifications:** Real-time feedback using React Hot Toast.

### Backend (REST API)
- **Robust Architecture:** Node.js/Express server following MVC patterns.
- **Database:** MongoDB with Mongoose ODM for structured data models.
- **Authentication:** Secure passwords with Bcrypt.js and JWT session handling.
- **File Uploads:** Local image upload support using Multer.
- **Data Seeding:** Built-in scripts to populate the database with initial dummy data.

### Security
- **Rate Limiting:** Protects against brute-force and DDoS attacks (`express-rate-limit`).
- **HTTP Headers:** Secured using `helmet`.
- **CORS:** Configured for safe cross-origin resource sharing.

---

## 🛠️ Tech Stack

| Category      | Technologies |
| ----------- | ----------- |
| **Frontend**  | React 18, Vite, Tailwind CSS, React Router DOM, Recharts, Lucide React, Axios |
| **Backend**   | Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt.js, Multer, Google Auth Library |
| **Tooling**   | Nodemon, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
├── backend/                  # Node.js & Express server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # API endpoint logic (auth, products, orders, etc.)
│   ├── middleware/           # Express middlewares (auth, error handling, etc.)
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API route definitions
│   ├── seeders/              # Database seeding scripts
│   ├── services/             # Core business logic
│   ├── uploads/              # Stored uploaded files (images)
│   ├── server.js             # Entry point for backend
│   └── package.json          
│
├── frontend/                 # React client application
│   ├── src/                  # React source code (components, pages, styles)
│   ├── public/               # Static assets
│   ├── vite.config.js        # Vite configuration
│   └── package.json
│
└── README.md                 # Project documentation
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js** (v16.x or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster)
* **npm** or **yarn**

---

## 🔑 Environment Variables

### Backend Configuration
Create a `.env` file in the `backend` directory based on the following template:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Google OAuth (Optional - For Google Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

---

## 💻 Running the Application

### 1. Start the Backend Server (Development Mode)
```bash
cd backend
npm run dev
```
*The server will start on `http://localhost:5000` (or the port defined in `.env`).*

### 2. Start the Frontend Development Server
Open a new terminal window/tab:
```bash
cd frontend
npm run dev
```
*The React app will be available at `http://localhost:5173`.*

---

## 🌱 Database Seeding

To quickly test the application with dummy data (users, products, categories, etc.), you can run the provided seeder script.

Make sure your MongoDB instance is running, then execute:
```bash
cd backend
npm run seed
```
