import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Button,
    Chip,
    AvatarGroup,
    Avatar,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

/**
 * ProjectCard component for displaying project information
 * @param {Object} project - Project data
 * @param {Function} onEdit - Edit handler
 * @param {Function} onDelete - Delete handler
 */
const ProjectCard = ({ project, onEdit, onDelete }) => {
    const navigate = useNavigate();

    // Format creation date
    const formattedDate = project.createdAt
        ? format(new Date(project.createdAt), 'MMM dd, yyyy')
        : 'Unknown date';

    // Handle view board click
    const handleViewBoardClick = (e) => {
        e.stopPropagation();
        navigate(`/projects/${project._id}/board`);
    };

    // Handle card click
    const handleCardClick = () => {
        navigate(`/projects/${project._id}`);
    };

    // Handle edit click
    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(project);
    };

    // Handle delete click
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (onDelete) onDelete(project);
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                },
                cursor: 'pointer'
            }}
            onClick={handleCardClick}
        >
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {project.name}
                    </Typography>
                    <Box>
                        <Tooltip title="Edit project">
                            <IconButton size="small" onClick={handleEditClick}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete project">
                            <IconButton size="small" onClick={handleDeleteClick}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{
                        minHeight: '60px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {project.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                        icon={<GroupIcon />}
                        label={`${project.members?.length || 0} members`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                        Created: {formattedDate}
                    </Typography>
                </Box>

                {project.members && project.members.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                            {project.members.map(member => (
                                <Tooltip key={member._id} title={member.name || 'Unknown'}>
                                    <Avatar sx={{ width: 30, height: 30, fontSize: '0.875rem' }}>
                                        {member.name ? member.name.charAt(0) : 'U'}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>
                )}
            </CardContent>

            <CardActions>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<DashboardIcon />}
                    onClick={handleViewBoardClick}
                    fullWidth
                >
                    View Board
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProjectCard; 