import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#fff',
        },
        secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#fff',
        },
        error: {
            main: '#f44336',
        },
        background: {
            default: '#f5f5f5',
        },
        text: {
            primary: '#2d3748',
            secondary: '#718096',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        // Task status colors
        status: {
            todo: '#e2e8f0',      // Light gray
            inProgress: '#3182ce', // Blue
            completed: '#48bb78',  // Green
        },
        // Task priority colors
        priority: {
            low: '#9ae6b4',     // Light green
            medium: '#fbd38d',  // Light orange
            high: '#fc8181',    // Light red
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
        },
        h3: {
            fontSize: '1.8rem',
            fontWeight: 500,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        h5: {
            fontSize: '1.2rem',
            fontWeight: 500,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

export default theme; 