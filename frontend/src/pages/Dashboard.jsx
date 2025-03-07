import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Paper,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as TaskIcon,
    Folder as ProjectIcon,
    CheckCircle as CompletedIcon,
    Pending as PendingIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/task/TaskCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projects, fetchProjects, loading: projectsLoading } = useProject();
    const { tasks, fetchTasksByUser, loading: tasksLoading } = useTask();
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        upcomingTasks: 0
    });

    // Fetch data on component mount
    useEffect(() => {
        fetchProjects();
        if (user?._id) {
            fetchTasksByUser(user._id);
        }
    }, [fetchProjects, fetchTasksByUser, user]);

    // Calculate stats when data changes
    useEffect(() => {
        if (projects && tasks) {
            const now = new Date();
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(now.getDate() + 7);

            const completedTasks = tasks.filter(task => task.status === 'Completed').length;
            const pendingTasks = tasks.filter(task => task.status !== 'Completed').length;
            const upcomingTasks = tasks.filter(task => {
                const dueDate = new Date(task.dueDate);
                return task.status !== 'Completed' && dueDate > now && dueDate <= oneWeekFromNow;
            }).length;

            setStats({
                totalProjects: projects.length,
                totalTasks: tasks.length,
                completedTasks,
                pendingTasks,
                upcomingTasks
            });
        }
    }, [projects, tasks]);

    // Handle create project button click
    const handleCreateProject = () => {
        navigate('/projects/new');
    };

    // Handle create task button click
    const handleCreateTask = () => {
        navigate('/tasks/new');
    };

    // Loading state
    const isLoading = projectsLoading || tasksLoading;
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.name || 'User'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's an overview of your tasks and projects.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <ProjectIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5">{stats.totalProjects}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Projects
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                            <CompletedIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5">{stats.completedTasks}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Completed Tasks
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                            <PendingIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5">{stats.pendingTasks}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Pending Tasks
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Recent Tasks */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardHeader
                            title="My Recent Tasks"
                            action={
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateTask}
                                >
                                    New Task
                                </Button>
                            }
                        />
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                            {tasks.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        You don't have any tasks yet.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        sx={{ mt: 2 }}
                                        onClick={handleCreateTask}
                                    >
                                        Create Your First Task
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ p: 2 }}>
                                    {tasks.slice(0, 5).map(task => (
                                        <TaskCard key={task._id} task={task} />
                                    ))}
                                    {tasks.length > 5 && (
                                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                                            <Button
                                                variant="text"
                                                onClick={() => navigate('/tasks')}
                                            >
                                                View All Tasks
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Projects and Upcoming Tasks */}
                <Grid item xs={12} md={5}>
                    {/* Recent Projects */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            title="My Projects"
                            action={
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateProject}
                                >
                                    New Project
                                </Button>
                            }
                        />
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                            {projects.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        You don't have any projects yet.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        sx={{ mt: 2 }}
                                        onClick={handleCreateProject}
                                    >
                                        Create Your First Project
                                    </Button>
                                </Box>
                            ) : (
                                <List>
                                    {projects.slice(0, 5).map(project => (
                                        <React.Fragment key={project._id}>
                                            <ListItem
                                                button
                                                onClick={() => navigate(`/projects/${project._id}`)}
                                            >
                                                <ListItemIcon>
                                                    <ProjectIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={project.name}
                                                    secondary={`${project.members?.length || 0} members`}
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                    {projects.length > 5 && (
                                        <ListItem
                                            button
                                            onClick={() => navigate('/projects')}
                                            sx={{ justifyContent: 'center' }}
                                        >
                                            <ListItemText
                                                primary="View All Projects"
                                                primaryTypographyProps={{ color: 'primary' }}
                                                sx={{ textAlign: 'center' }}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Tasks */}
                    <Card>
                        <CardHeader
                            title="Upcoming Deadlines"
                            avatar={
                                <Avatar sx={{ bgcolor: 'error.main' }}>
                                    <ScheduleIcon />
                                </Avatar>
                            }
                        />
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                            {stats.upcomingTasks === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No upcoming deadlines this week.
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {tasks
                                        .filter(task => {
                                            const now = new Date();
                                            const oneWeekFromNow = new Date();
                                            oneWeekFromNow.setDate(now.getDate() + 7);
                                            const dueDate = new Date(task.dueDate);
                                            return task.status !== 'Completed' && dueDate > now && dueDate <= oneWeekFromNow;
                                        })
                                        .slice(0, 5)
                                        .map(task => (
                                            <React.Fragment key={task._id}>
                                                <ListItem
                                                    button
                                                    onClick={() => navigate(`/tasks/${task._id}`)}
                                                >
                                                    <ListItemIcon>
                                                        <TaskIcon color="error" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={task.title}
                                                        secondary={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                                                    />
                                                </ListItem>
                                                <Divider component="li" />
                                            </React.Fragment>
                                        ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 