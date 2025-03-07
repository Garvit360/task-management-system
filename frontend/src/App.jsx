import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

// Context
import { useAuth } from './context/AuthContext';

function App() {
    const { checkAuthStatus, loading } = useAuth();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="projects" element={<ProjectList />} />
                <Route path="projects/:projectId" element={<ProjectDetails />} />
                <Route path="projects/:projectId/board" element={<TaskBoard />} />
                <Route path="tasks/:taskId" element={<TaskDetails />} />
                <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App; 