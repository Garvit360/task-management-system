import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if user is already logged in
    const checkAuthStatus = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login user
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const data = await authService.login(email, password);

            // Store token in localStorage
            localStorage.setItem('token', data.user.token);

            // Set user in state
            setUser(data.user);

            toast.success('Successfully logged in!');
            navigate('/dashboard');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Register user
    const register = useCallback(async (userData) => {
        try {
            setLoading(true);
            const data = await authService.register(userData);

            // Store token in localStorage
            localStorage.setItem('token', data.user.token);

            // Set user in state
            setUser(data.user);

            toast.success('Registration successful!');
            navigate('/dashboard');
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Logout user
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await authService.logout();

            // Remove token from localStorage
            localStorage.removeItem('token');

            // Clear user from state
            setUser(null);

            toast.success('Successfully logged out!');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout on client side even if API call fails
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Update user profile
    const updateProfile = useCallback(async (userData) => {
        try {
            setLoading(true);
            const updatedUser = await authService.updateProfile(userData);
            setUser(prevUser => ({ ...prevUser, ...updatedUser }));
            toast.success('Profile updated successfully!');
            return true;
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update password
    const updatePassword = useCallback(async (passwordData) => {
        try {
            setLoading(true);
            await authService.updatePassword(passwordData);
            toast.success('Password updated successfully!');
            return true;
        } catch (error) {
            console.error('Password update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update password. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoize context value
    const contextValue = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuthStatus,
        updateProfile,
        updatePassword
    }), [user, loading, login, register, logout, checkAuthStatus, updateProfile, updatePassword]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};