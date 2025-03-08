import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ViewList as ViewListIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { project, loading: projectLoading, fetchProject, updateProject, deleteProject } = useProject();
    const { tasks, fetchTasksByProject, loading: tasksLoading } = useTask();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [editedProject, setEditedProject] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchProject(projectId);
            fetchTasksByProject(projectId);
        }
    }, [projectId, fetchProject, fetchTasksByProject]);

    useEffect(() => {
        if (project) {
            setEditedProject({
                name: project.name,
                description: project.description,
                status: project.status || 'Active'
            });
        }
    }, [project]);

    if (projectLoading || !project || !editedProject) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const handleEditDialogOpen = () => {
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        // Reset form values
        setEditedProject({
            name: project.name,
            description: project.description,
            status: project.status || 'Active'
        });
    };

    const handleMemberDialogOpen = () => {
        setMemberDialogOpen(true);
    };

    const handleMemberDialogClose = () => {
        setMemberDialogOpen(false);
        setEmail('');
    };

    const handleDeleteDialogOpen = () => {
        setConfirmDeleteOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setConfirmDeleteOpen(false);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedProject({
            ...editedProject,
            [name]: value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await updateProject(projectId, editedProject);
        setEditDialogOpen(false);
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        // Assuming addMemberToProject is a function in the project context that handles adding members
        // await addMemberToProject(projectId, email);
        setEmail('');
        setMemberDialogOpen(false);
    };

    const handleDeleteProject = async () => {
        await deleteProject(projectId);
        // Navigate to projects list - this should be handled by your deleteProject function
    };

    return (
        <Box sx={{ py: 4, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {project.name}
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditDialogOpen}
                        sx={{ mr: 1 }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteDialogOpen}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            <Chip
                label={project.status || 'Active'}
                color={project.status === 'Active' ? 'success' : 'default'}
                sx={{ mb: 3 }}
            />

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {project.description || 'No description provided.'}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Recent Tasks
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to={`/projects/${projectId}/board`}
                                startIcon={<ViewListIcon />}
                            >
                                Task Board
                            </Button>
                        </Box>

                        {tasksLoading ? (
                            <CircularProgress />
                        ) : tasks.length > 0 ? (
                            <List>
                                {tasks.slice(0, 5).map((task) => (
                                    <React.Fragment key={task._id}>
                                        <ListItem
                                            component={Link}
                                            to={`/tasks/${task._id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={task.title}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" color="textPrimary">
                                                            {task.status}
                                                        </Typography>
                                                        {" — "}{task.description?.substring(0, 60)}
                                                        {task.description?.length > 60 ? "..." : ""}
                                                    </>
                                                }
                                            />
                                            <Chip
                                                label={task.priority}
                                                color={
                                                    task.priority === 'High' ? 'error' :
                                                        task.priority === 'Medium' ? 'warning' : 'success'
                                                }
                                                size="small"
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" color="textSecondary" align="center" py={3}>
                                No tasks yet. Create some on the Task Board.
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                Team Members
                            </Typography>
                            <IconButton color="primary" onClick={handleMemberDialogOpen}>
                                <AddIcon />
                            </IconButton>
                        </Box>

                        {project.members && project.members.length > 0 ? (
                            <List>
                                {project.members.map((member) => (
                                    <ListItem key={member._id || member.id}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <PersonIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={member.name}
                                            secondary={member.email}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" color="textSecondary" align="center" py={2}>
                                No team members yet.
                            </Typography>
                        )}
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Project Details
                        </Typography>
                        <Box my={2}>
                            <Typography variant="body2" color="textSecondary">
                                Created By
                            </Typography>
                            <Typography variant="body1">
                                {project.createdBy?.name || 'Unknown'}
                            </Typography>
                        </Box>
                        <Box my={2}>
                            <Typography variant="body2" color="textSecondary">
                                Created On
                            </Typography>
                            <Typography variant="body1">
                                {new Date(project.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Box my={2}>
                            <Typography variant="body2" color="textSecondary">
                                Last Updated
                            </Typography>
                            <Typography variant="body1">
                                {new Date(project.updatedAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Edit Project Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Project</DialogTitle>
                <form onSubmit={handleEditSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Project Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={editedProject.name}
                            onChange={handleEditChange}
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
                            value={editedProject.description}
                            onChange={handleEditChange}
                            multiline
                            rows={4}
                            sx={{ mb: 3 }}
                        />
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={editedProject.status}
                                onChange={handleEditChange}
                                label="Status"
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="On Hold">On Hold</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditDialogClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Save Changes
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={memberDialogOpen} onClose={handleMemberDialogClose}>
                <DialogTitle>Add Team Member</DialogTitle>
                <form onSubmit={handleAddMember}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleMemberDialogClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            Add Member
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDeleteOpen} onClose={handleDeleteDialogClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this project? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                    <Button onClick={handleDeleteProject} color="error" variant="contained">
                        Delete Project
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectDetails; 