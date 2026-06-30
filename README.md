# Phone App (E-commerce Application)

A full-stack e-commerce platform featuring a modern UI and robust backend API.

## Features
- **Frontend**: React-based UI with Tailwind CSS for responsive design.
- **Backend**: Node.js/Express API with MongoDB for data storage.
- **Authentication**: JWT and Google OAuth integration.
- **File Uploads**: Image upload support with Multer.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Recharts (Data Visualization)
- Lucide React (Icons)
- Google OAuth

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js
- Multer (File Handling)

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Run Backend (Development Mode)**:
```bash
cd backend
npm run dev
```

**Run Frontend (Development Mode)**:
```bash
cd frontend
npm run dev
```

## Security & API Features
- Rate limiting for endpoint protection
- Helmet for HTTP header security
- CORS enabled
- Data seeding script available (`npm run seed` in backend)
