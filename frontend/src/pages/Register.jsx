import React, { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAddOutlined as PersonAddIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register, isAuthenticated, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Member'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Check password match when typing confirm password
        if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
            if (name === 'password' && value !== formData.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Passwords do not match'
                }));
            } else if (name === 'confirmPassword' && value !== formData.password) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: 'Passwords do not match'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: ''
                }));
            }
        }
    };

    // Toggle password visibility
    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registerData } = formData;
        await register(registerData);
    };

    return (
        <Box className="auth-container">
            <Container maxWidth="sm">
                <Paper elevation={3} className="auth-form">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '50%',
                            p: 1,
                            mb: 2
                        }}>
                            <PersonAddIcon fontSize="large" />
                        </Box>
                        <Typography component="h1" variant="h5" gutterBottom>
                            Create an Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                            Join us to start managing your tasks and projects efficiently.
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                autoComplete="new-password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                disabled={loading}
                            />

                            <FormControl fullWidth margin="normal" error={!!errors.role}>
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    label="Role"
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <MenuItem value="Member">Member</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Admin">Admin</MenuItem>
                                </Select>
                                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                            </FormControl>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                            </Button>

                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Link component={RouterLink} to="/login" variant="body2">
                                    Already have an account? Sign In
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register; 