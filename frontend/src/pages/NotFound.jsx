import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center',
                    py: 5
                }}
            >
                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: { xs: '6rem', md: '10rem' },
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 2
                    }}
                >
                    404
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Page Not Found
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '600px', mb: 4 }}>
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable. Please check the URL or go back to the homepage.
                </Typography>

                <Button
                    component={RouterLink}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                >
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound; 