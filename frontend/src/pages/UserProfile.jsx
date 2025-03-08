import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Divider,
    CircularProgress,
    Avatar,
    Tabs,
    Tab,
    IconButton,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Chip
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { Link } from 'react-router-dom';

// Tab Panel Component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const UserProfile = () => {
    const { user, loading, updateProfile, updatePassword } = useAuth();
    const { tasks, fetchUserTasks } = useTask();
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [userData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        bio: user?.bio || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    // Fetch user's tasks when component mounts
    React.useEffect(() => {
        fetchUserTasks();
    }, [fetchUserTasks]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditToggle = () => {
        if (editMode) {
            // Reset form if canceling edit
            setUserData({
                name: user?.name || '',
                email: user?.email || '',
                role: user?.role || '',
                bio: user?.bio || ''
            });
        }
        setEditMode(!editMode);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        await updateProfile(userData);
        setEditMode(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordError('');
        await updatePassword(passwordData);

        // Reset form after submission
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
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
            <Typography variant="h4" component="h1" gutterBottom>
                User Profile
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Box mb={3}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto',
                                    bgcolor: 'primary.main'
                                }}
                            >
                                {user?.name?.charAt(0) || <PersonIcon fontSize="large" />}
                            </Avatar>
                        </Box>

                        <Typography variant="h5" gutterBottom>
                            {user?.name}
                        </Typography>

                        <Typography variant="body1" color="textSecondary" gutterBottom>
                            {user?.email}
                        </Typography>

                        <Chip
                            label={user?.role || 'Member'}
                            color="primary"
                            size="small"
                            sx={{ mt: 1 }}
                        />

                        <Box mt={3}>
                            <Button
                                variant="outlined"
                                startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                                onClick={handleEditToggle}
                                fullWidth
                            >
                                {editMode ? 'Cancel Edit' : 'Edit Profile'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ width: '100%' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="profile tabs"
                            variant="fullWidth"
                        >
                            <Tab label="Profile Details" />
                            <Tab label="My Tasks" />
                            <Tab label="Change Password" />
                        </Tabs>

                        {/* Profile Details Tab */}
                        <TabPanel value={tabValue} index={0}>
                            {!editMode ? (
                                <Box>
                                    <Box mb={3}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Name
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.name}
                                        </Typography>
                                    </Box>

                                    <Box mb={3}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Email
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.email}
                                        </Typography>
                                    </Box>

                                    <Box mb={3}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Role
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.role || 'Member'}
                                        </Typography>
                                    </Box>

                                    <Box mb={3}>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            Bio
                                        </Typography>
                                        <Typography variant="body1">
                                            {user?.bio || 'No bio provided.'}
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <form onSubmit={handleProfileSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Full Name"
                                                name="name"
                                                value={userData.name}
                                                onChange={handleProfileChange}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={userData.email}
                                                onChange={handleProfileChange}
                                                fullWidth
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Bio"
                                                name="bio"
                                                value={userData.bio}
                                                onChange={handleProfileChange}
                                                fullWidth
                                                multiline
                                                rows={4}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" justifyContent="flex-end">
                                                <Button
                                                    type="button"
                                                    onClick={handleEditToggle}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                >
                                                    Save Changes
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </form>
                            )}
                        </TabPanel>

                        {/* My Tasks Tab */}
                        <TabPanel value={tabValue} index={1}>
                            {tasks && tasks.length > 0 ? (
                                <List>
                                    {tasks.map((task) => (
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
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        <AssignmentIcon />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={task.title}
                                                    secondary={
                                                        <>
                                                            <Typography component="span" variant="body2" color="textPrimary">
                                                                {task.project?.name || 'No Project'}
                                                            </Typography>
                                                            {" — "}{task.description?.substring(0, 60)}
                                                            {task.description?.length > 60 ? "..." : ""}
                                                        </>
                                                    }
                                                />
                                                <Chip
                                                    label={task.status}
                                                    color={
                                                        task.status === 'Completed' ? 'success' :
                                                            task.status === 'In Progress' ? 'info' : 'default'
                                                    }
                                                    size="small"
                                                    sx={{ mr: 1 }}
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
                                            <Divider variant="inset" component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
                                    <AssignmentIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h6" color="textSecondary" gutterBottom>
                                        No tasks assigned to you
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" align="center">
                                        Tasks assigned to you will appear here
                                    </Typography>
                                </Box>
                            )}
                        </TabPanel>

                        {/* Change Password Tab */}
                        <TabPanel value={tabValue} index={2}>
                            <form onSubmit={handlePasswordSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Current Password"
                                            name="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="New Password"
                                            name="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            fullWidth
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            fullWidth
                                            required
                                            error={!!passwordError}
                                            helperText={passwordError}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="flex-end">
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                            >
                                                Update Password
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserProfile; 