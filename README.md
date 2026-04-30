# Ecommerce Backend (Production-Ready Upgrade)

This project is now upgraded to a production-style Node.js + Express + MongoDB stack with:

- MVC architecture
- JWT authentication
- Google OAuth (Passport.js)
- Multer profile image uploads
- Role-based access (`admin`, `user`)
- Products CRUD with pagination, search, and filter
- Security middleware (`helmet`, `cors`, `express-validator`)
- Frontend pages for dashboard, signup, login, profile, and products

## 1) Prerequisites

- Node.js 18+ installed
- MongoDB Community Server running locally on port `27017`

## 2) Install dependencies

```bash
npm install
```

## 3) Environment setup

Create `.env` in project root (already created in this workspace). Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerceDB
JWT_SECRET=dev_jwt_secret_change_me_12345
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@12345
```

## 4) Seed admin user (required for admin product APIs)

```bash
npm run seed:admin
```

This creates/updates admin login credentials from `.env`.

## 5) Run the application

```bash
npm start
```

Open:

- `http://localhost:5000` (Dashboard)
- `http://localhost:5000/signup.html`
- `http://localhost:5000/login.html`
- `http://localhost:5000/profile.html`
- `http://localhost:5000/products.html`

## 6) Enable Google login (optional)

Set:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`

If empty, app runs normally and Google login route responds as not configured.

## 7) Enable Cloudinary avatar upload (optional)

Set:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If empty, avatar upload falls back to local `/uploads`.
