# DineSmart Queue

![GitHub License](https://img.shields.io/github/license/aayushkulkarni/dinesmart-queue)
![GitHub Issues](https://img.shields.io/github/issues/aayushkulkarni/dinesmart-queue)
![GitHub Stars](https://img.shields.io/github/stars/aayushkulkarni/dinesmart-queue)
![GitHub Forks](https://img.shields.io/github/forks/aayushkulkarni/dinesmart-queue)
![GitHub Followers](https://img.shields.io/github/followers/aayushkulkarni)

DineSmart Queue is a full-stack restaurant queue and table management app. It combines a Vite + React frontend with an Express + MongoDB backend for guest queueing, table status tracking, and admin operations.

## Table of Contents
- [What It Includes](#what-it-includes)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Routes](#frontend-routes)
- [Backend API](#backend-api)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Useful Scripts](#useful-scripts)
- [Database Behavior](#database-behavior)
- [Current Implementation Notes](#current-implementation-notes)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## What It Includes
- Public landing page with restaurant-style UI
- Menu browsing with cart interactions
- Queue join flow backed by the API
- Table management backend with automatic seeding for 30 tables
- Admin API for queue control and table updates
- JWT-based auth endpoints for user and admin login
- Socket.IO server for realtime update events

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- Testing: Vitest, Testing Library

## Project Structure
```text
.
├── src/                  # React frontend
├── public/               # Static frontend assets
├── backend/              # Express API + MongoDB models
└── README.md
```

## Frontend Routes
- `/` home page
- `/menu` browse dishes and add items to cart
- `/queue` join and view the waiting queue
- `/tables` view the table layout
- `/login` sign in screen
- `/signup` sign up screen
- `/admin` protected admin page

## Backend API
Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/register-admin`
- `POST /auth/login`
- `POST /auth/admin-login`

### Queue
- `GET /queue`
- `POST /queue/join`

### Tables
- `GET /tables`
- `PUT /tables/:id/status`

### Admin
These routes require an admin bearer token.
- `GET /admin/dashboard`
- `PUT /admin/queue/:id/call`
- `PUT /admin/queue/:id/seat`
- `DELETE /admin/queue/:id`
- `PUT /admin/tables/:id/status`

## Environment Variables
### Frontend
Create a `.env` file in the project root if you want the frontend to call your local backend:
```env
VITE_API_BASE_URL=http://localhost:5000
```
Note: the frontend defaults to `http://localhost:5000` when `VITE_API_BASE_URL` is not set.

### Backend
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dinesmart-queue
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
ADMIN_SETUP_KEY=choose-a-secure-admin-setup-key
```

## Getting Started
### 1. Install dependencies
Frontend:
```bash
npm install
```
Backend:
```bash
cd backend
npm install
```

### 2. Start the backend
From `backend/`:
```bash
npm run dev
```
The API starts on `http://localhost:5000` by default.

### 3. Start the frontend
From the project root:
```bash
npm run dev
```
The Vite app usually starts on `http://localhost:5173`.

## Useful Scripts
Frontend:
```bash
npm run dev
npm run build
npm run lint
npm run test
```
Backend:
```bash
cd backend
npm run dev
npm start
```

## Database Behavior
- MongoDB is required for backend startup
- On startup, the backend auto-creates up to 30 default tables if they do not already exist
- Queue entries and users are stored in MongoDB

## Current Implementation Notes
- Frontend login and signup now use the backend auth API and persist the JWT in local storage
- Admin account creation is supported through `/auth/register-admin` and requires `ADMIN_SETUP_KEY`
- The home, queue, tables, and admin dashboard screens now read live backend data
- Socket.IO is initialized on the backend and emits events such as `queueUpdated` and `customerCalled`
- The frontend currently refreshes operational data with polling rather than a Socket.IO client subscription

## Testing
Run frontend tests from the project root:
```bash
npm run test
```

## Future Improvements
- Connect frontend auth screens to the backend auth API
- Replace demo admin data with live dashboard data
- Subscribe the frontend to Socket.IO updates
- Sync the table layout page with backend table records
- Add backend tests and seed scripts for admin users

## Installation
Detailed steps to get the development environment running:
1. Ensure you have Node.js (v18+), npm, and MongoDB installed.
2. Clone the repository.
3. Install frontend dependencies: `npm install`
4. Install backend dependencies: `cd backend && npm install`
5. Set up environment variables as described above.
6. Start MongoDB service.
7. Run the backend: `cd backend && npm run dev`
8. Run the frontend: `npm run dev`

## Usage
After installation, you can:
- Visit `http://localhost:5173` to access the customer-facing interface.
- Visit `http://localhost:5173/admin` to access the admin dashboard (requires admin login).
- Use the API directly at `http://localhost:5000/api` for integration or testing.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Ensure tests pass and linting is clean.
5. Submit a pull request with a clear description of your changes.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Thanks to the creators of Vite, React, Express, MongoDB, and all the open-source libraries used.
- Special thanks to the shadcn/ui team for the beautiful UI components.