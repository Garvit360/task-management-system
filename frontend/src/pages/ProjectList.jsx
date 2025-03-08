import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Add as AddIcon, People as PeopleIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

const ProjectList = () => {
    const { user } = useAuth();
    const { projects, loading, fetchProjects, createProject } = useProject();
    const [open, setOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setNewProject({
            name: '',
            description: '',
            status: 'Active'
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProject({
            ...newProject,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createProject(newProject);
        handleClose();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleClickOpen}
                >
                    New Project
                </Button>
            </Box>

            {projects.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        No projects found
                    </Typography>
                    <Typography variant="body1" color="textSecondary" align="center" mb={3}>
                        Create your first project to get started
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleClickOpen}
                    >
                        Create Project
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        {project.name}
                                    </Typography>
                                    <Chip
                                        label={project.status}
                                        color={project.status === 'Active' ? 'success' : 'default'}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        {project.description}
                                    </Typography>
                                    <Box display="flex" alignItems="center" mt={1}>
                                        <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="textSecondary">
                                            {project.members?.length || 0} members
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        component={Link}
                                        to={`/projects/${project._id}`}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        size="small"
                                        component={Link}
                                        to={`/projects/${project._id}/board`}
                                    >
                                        Task Board
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create Project Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Project</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Project Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newProject.name}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newProject.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            sx={{ mb: 3 }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={newProject.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="On Hold">On Hold</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ProjectList; 