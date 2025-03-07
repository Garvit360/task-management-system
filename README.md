# Collaborative Task Management System

A full-stack application for managing projects and tasks with real-time collaboration.

## Project Structure

The project is divided into 4 phases:

1. **Phase 1: Backend** - Setting up the Node.js/Express/MongoDB backend
2. **Phase 2: Frontend** - Implementing the React frontend
3. **Phase 3: Features** - Adding advanced features like real-time updates, file uploads, etc.
4. **Phase 4: Deployment** - Preparing the application for production deployment

## Backend Structure

The backend is built with Node.js, Express, and MongoDB with the following structure:

```
backend/
│
├── src/
│   ├── config/         # Database and environment configuration
│   ├── models/         # Mongoose data models
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Custom middleware (auth, error handling)
│   └── server.js       # Entry point
│
├── package.json        # Dependencies and scripts
└── .env.example        # Environment variables template
```

## Frontend Structure

The frontend is built with React with the following structure:

```
frontend/
│
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API calls to backend
│   ├── App.jsx         # Main application component
│   └── index.jsx       # Entry point
│
├── package.json        # Dependencies and scripts
└── public/             # Static assets
```

## Features

- User authentication with JWT
- Role-based access control (Admin, Manager, Member)
- Project management
- Task creation, assignment, and tracking
- Task comments and file attachments
- Real-time notifications
- Responsive UI with modern design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

3. Set up the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Projects
- `GET /api/projects` - Get all accessible projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member from project

### Tasks
- `GET /api/tasks` - Get all accessible tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task
- `POST /api/tasks/:id/attachments` - Upload attachment to task
- `DELETE /api/tasks/:id/attachments/:attachmentId` - Delete attachment
- `GET /api/tasks/user/:userId` - Get tasks by user
- `GET /api/tasks/project/:projectId` - Get tasks by project
