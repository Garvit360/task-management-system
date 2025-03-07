import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Avatar,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

/**
 * TaskCard component for displaying task information
 * @param {Object} task - Task data
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 * @param {boolean} isDraggable - Whether the card is draggable
 * @param {Object} dragHandleProps - Drag handle props from react-beautiful-dnd
 */
const TaskCard = ({
    task,
    onEdit,
    onDelete,
    isDraggable = false,
    dragHandleProps = {}
}) => {
    const navigate = useNavigate();

    // Format due date
    const formattedDueDate = task.dueDate
        ? format(new Date(task.dueDate), 'MMM dd, yyyy')
        : 'No due date';

    // Get status class
    const getStatusClass = (status) => {
        switch (status) {
            case 'To-Do':
                return 'status-todo';
            case 'In Progress':
                return 'status-in-progress';
            case 'Completed':
                return 'status-completed';
            default:
                return 'status-todo';
        }
    };

    // Get priority class
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'Low':
                return 'priority-low';
            case 'Medium':
                return 'priority-medium';
            case 'High':
                return 'priority-high';
            default:
                return 'priority-medium';
        }
    };

    // Handle card click
    const handleCardClick = () => {
        navigate(`/tasks/${task._id}`);
    };

    // Handle edit click
    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(task);
    };

    // Handle delete click
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(task);
    };

    return (
        <Card
            className="task-card"
            onClick={handleCardClick}
            sx={{
                mb: 2,
                cursor: 'pointer',
                position: 'relative'
            }}
            {...(isDraggable ? dragHandleProps : {})}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
                        {task.title}
                    </Typography>
                    <Box>
                        <Tooltip title="Edit task">
                            <IconButton size="small" onClick={handleEditClick}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete task">
                            <IconButton size="small" onClick={handleDeleteClick}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '40px'
                    }}
                >
                    {task.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                        label={task.status}
                        size="small"
                        className={`status-badge ${getStatusClass(task.status)}`}
                    />
                    <Chip
                        label={task.priority}
                        size="small"
                        className={`priority-badge ${getPriorityClass(task.priority)}`}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            {formattedDueDate}
                        </Typography>
                    </Box>

                    {task.assignee && (
                        <Tooltip title={`Assigned to: ${task.assignee.name || 'Unknown'}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Avatar
                                    sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                                >
                                    {task.assignee.name ? task.assignee.name.charAt(0) : 'U'}
                                </Avatar>
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TaskCard; 