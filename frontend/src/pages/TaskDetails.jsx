import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    TextField,
    CircularProgress,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarIcon,
    Comment as CommentIcon,
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

const TaskDetails = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentTask, loading, fetchTaskById, updateTask, deleteTask, addComment } = useTask();
    const [editMode, setEditMode] = useState(false);
    const [comment, setComment] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editedTask, setEditedTask] = useState(null);

    useEffect(() => {
        if (taskId) {
            fetchTaskById(taskId);
        }
    }, [taskId, fetchTaskById]);

    useEffect(() => {
        if (currentTask && !editedTask) {
            setEditedTask({
                title: currentTask.title,
                description: currentTask.description,
                status: currentTask.status,
                priority: currentTask.priority,
                dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '',
                assignee: currentTask.assignee?._id
            });
        }
    }, [currentTask, editedTask]);

    if (loading || !currentTask || !editedTask) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedTask({
            ...editedTask,
            [name]: value
        });
    };

    const handleSave = async () => {
        await updateTask(taskId, editedTask);
        setEditMode(false);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (comment.trim()) {
            await addComment(taskId, { text: comment });
            setComment('');
        }
    };

    const handleDeleteConfirm = () => {
        setConfirmDelete(true);
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(false);
    };

    const handleDelete = async () => {
        await deleteTask(taskId);
        navigate(`/projects/${currentTask.project._id}/board`);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'error';
            case 'Medium':
                return 'warning';
            case 'Low':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'success';
            case 'In Progress':
                return 'info';
            case 'To-Do':
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ py: 4, px: 2 }}>
            <Box display="flex" alignItems="center" mb={4}>
                <IconButton
                    component={Link}
                    to={`/projects/${currentTask.project._id}/board`}
                    sx={{ mr: 2 }}
                >
                    <ArrowBackIcon />
                </IconButton>
                {!editMode ? (
                    <Typography variant="h4" component="h1">
                        {currentTask.title}
                    </Typography>
                ) : (
                    <TextField
                        name="title"
                        value={editedTask.title}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        required
                    />
                )}
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Description</Typography>
                            {!editMode ? (
                                <IconButton onClick={handleEditToggle} color="primary">
                                    <EditIcon />
                                </IconButton>
                            ) : (
                                <Box>
                                    <Button onClick={handleEditToggle} sx={{ mr: 1 }}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} variant="contained" color="primary">
                                        Save
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {!editMode ? (
                            <Typography variant="body1" paragraph>
                                {currentTask.description || 'No description provided.'}
                            </Typography>
                        ) : (
                            <TextField
                                name="description"
                                value={editedTask.description}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={4}
                                sx={{ mb: 3 }}
                            />
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Grid container spacing={3}>
                            {editMode ? (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                name="status"
                                                value={editedTask.status}
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
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>Priority</InputLabel>
                                            <Select
                                                name="priority"
                                                value={editedTask.priority}
                                                onChange={handleChange}
                                                label="Priority"
                                            >
                                                <MenuItem value="Low">Low</MenuItem>
                                                <MenuItem value="Medium">Medium</MenuItem>
                                                <MenuItem value="High">High</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="dueDate"
                                            label="Due Date"
                                            type="date"
                                            value={editedTask.dueDate}
                                            onChange={handleChange}
                                            fullWidth
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                                        <Chip
                                            label={currentTask.status}
                                            color={getStatusColor(currentTask.status)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                                        <Chip
                                            label={currentTask.priority}
                                            color={getPriorityColor(currentTask.priority)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="textSecondary">Due Date</Typography>
                                        <Box display="flex" alignItems="center">
                                            <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                                            <Typography>
                                                {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'No due date'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Comments
                        </Typography>

                        <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', mb: 3 }}>
                            <TextField
                                variant="outlined"
                                placeholder="Add a comment..."
                                fullWidth
                                value={comment}
                                onChange={handleCommentChange}
                            />
                            <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
                                <SendIcon />
                            </IconButton>
                        </Box>

                        <Divider />

                        {currentTask.comments && currentTask.comments.length > 0 ? (
                            <List>
                                {currentTask.comments.map((comment, index) => (
                                    <React.Fragment key={comment._id || index}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>
                                                    {comment.user?.name?.charAt(0) || 'U'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle2"
                                                        component="span"
                                                    >
                                                        {comment.user?.name || 'Unknown User'}
                                                        <Typography
                                                            variant="caption"
                                                            component="span"
                                                            color="textSecondary"
                                                            sx={{ ml: 1 }}
                                                        >
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        color="textPrimary"
                                                        component="span"
                                                        sx={{ mt: 1, display: 'block' }}
                                                    >
                                                        {comment.text}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < currentTask.comments.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Box py={3} textAlign="center">
                                <CommentIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography color="textSecondary">
                                    No comments yet
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Task Details
                        </Typography>

                        <Box my={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Project
                            </Typography>
                            <Typography variant="body1" component={Link} to={`/projects/${currentTask.project._id}`} sx={{ textDecoration: 'none' }}>
                                {currentTask.project.name}
                            </Typography>
                        </Box>

                        <Box my={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Assigned To
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                                <Typography>
                                    {currentTask.assignee?.name || 'Not assigned'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box my={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Created By
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                                <Typography>
                                    {currentTask.createdBy?.name || 'Unknown'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box my={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Created On
                            </Typography>
                            <Typography variant="body1">
                                {new Date(currentTask.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>

                        <Box my={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Last Updated
                            </Typography>
                            <Typography variant="body1">
                                {new Date(currentTask.updatedAt).toLocaleDateString()}
                            </Typography>
                        </Box>

                        <Box mt={4} display="flex" justifyContent="flex-end">
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteConfirm}
                            >
                                Delete Task
                            </Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Attachments
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<AttachFileIcon />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Add Attachment
                        </Button>

                        {currentTask.attachments && currentTask.attachments.length > 0 ? (
                            <List>
                                {currentTask.attachments.map((attachment, index) => (
                                    <ListItem key={attachment._id || index}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <AttachFileIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={attachment.name}
                                            secondary={`Added by ${attachment.addedBy?.name || 'Unknown'} on ${new Date(attachment.createdAt).toLocaleDateString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box py={2} textAlign="center">
                                <Typography color="textSecondary">
                                    No attachments yet
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskDetails; 