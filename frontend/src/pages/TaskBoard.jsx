import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskBoardComponent from '../components/task/TaskBoard';

const TaskBoard = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { project, loading: projectLoading, fetchProject } = useProject();
    const { tasks, loading: tasksLoading, fetchTasksByProject, createTask } = useTask();
    const [open, setOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'To-Do',
        priority: 'Medium',
        dueDate: ''
    });

    useEffect(() => {
        if (projectId) {
            fetchProject(projectId);
            fetchTasksByProject(projectId);
        }
    }, [projectId, fetchProject, fetchTasksByProject]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // Reset form
        setNewTask({
            title: '',
            description: '',
            status: 'To-Do',
            priority: 'Medium',
            dueDate: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTask({
            ...newTask,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare task data with project reference
        const taskData = {
            ...newTask,
            project: projectId
        };

        // Call API to create task
        await createTask(taskData);
        handleClose();
    };

    const handleEditTask = (taskId) => {
        navigate(`/tasks/${taskId}`);
    };

    if (projectLoading || tasksLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" gutterBottom>
                    {project?.name || 'Project'} Task Board
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleClickOpen}
                >
                    New Task
                </Button>
            </Box>

            {/* Task Board Component */}
            <TaskBoardComponent
                projectId={projectId}
                onAddTask={handleClickOpen}
                onEditTask={handleEditTask}
            />

            {/* Add Task Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoFocus
                                    name="title"
                                    label="Task Title"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={newTask.title}
                                    onChange={handleChange}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={newTask.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={newTask.status}
                                        onChange={handleChange}
                                        label="Status"
                                    >
                                        <MenuItem value="To-Do">To-Do</MenuItem>
                                        <MenuItem value="In Progress">In Progress</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={newTask.priority}
                                        onChange={handleChange}
                                        label="Priority"
                                    >
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="dueDate"
                                    label="Due Date"
                                    type="date"
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={newTask.dueDate}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
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

export default TaskBoard; 