import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import taskService from '../services/taskService';
import useTaskOptimizations from '../hooks/useTaskOptimizations';

// Create context
const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use task optimizations hook
    const { debounce, cacheTasks, getCachedTasks } = useTaskOptimizations();

    // Fetch all tasks or filter by project or user
    const fetchTasks = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.getTasks(filters);
            setTasks(data);
            return data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError(error.message || 'Failed to fetch tasks');
            toast.error('Failed to fetch tasks');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch tasks by project ID with caching
    const fetchTasksByProject = useCallback(async (projectId) => {
        try {
            // First check cache
            const cachedData = getCachedTasks(projectId);
            if (cachedData) {
                setTasks(cachedData);

                // Refresh in background after returning cached data
                taskService.getTasksByProject(projectId).then(freshData => {
                    setTasks(freshData);
                    cacheTasks(projectId, freshData);
                }).catch(err => console.error('Background refresh failed:', err));

                return cachedData;
            }

            // If no cache hit, fetch normally
            setLoading(true);
            setError(null);
            const data = await taskService.getTasksByProject(projectId);
            setTasks(data);

            // Store in cache for future use
            cacheTasks(projectId, data);
            return data;
        } catch (error) {
            console.error(`Error fetching tasks for project ${projectId}:`, error);
            setError(error.message || 'Failed to fetch project tasks');
            toast.error('Failed to fetch project tasks');
            return [];
        } finally {
            setLoading(false);
        }
    }, [getCachedTasks, cacheTasks]);

    // Fetch tasks by user ID
    const fetchTasksByUser = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.getTasksByUser(userId);
            setTasks(data);
            return data;
        } catch (error) {
            console.error(`Error fetching tasks for user ${userId}:`, error);
            setError(error.response?.data?.message || 'Failed to fetch user tasks');
            toast.error('Failed to fetch user tasks');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single task by ID
    const fetchTask = useCallback(async (taskId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.getTask(taskId);
            setCurrentTask(data);
            return data;
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to fetch task');
            toast.error('Failed to fetch task details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create task with debouncing to prevent duplicate submissions
    const createTask = useCallback((taskData) => {
        return debounce(async () => {
            try {
                setLoading(true);
                setError(null);
                const newTask = await taskService.createTask(taskData);
                setTasks(prevTasks => [...prevTasks, newTask]);
                toast.success('Task created successfully');
                return newTask;
            } catch (error) {
                console.error('Error creating task:', error);
                setError(error.message || 'Failed to create task');
                toast.error('Failed to create task');
                return null;
            } finally {
                setLoading(false);
            }
        }, 'createTask', 500)();
    }, [debounce]);

    // Update a task
    const updateTask = useCallback(async (taskId, taskData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.updateTask(taskId, taskData);

            // Update tasks list
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? data : task
                )
            );

            // Update current task if it's the one being modified
            if (currentTask && currentTask._id === taskId) {
                setCurrentTask(data);
            }

            toast.success('Task updated successfully!');
            return data;
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to update task');
            toast.error('Failed to update task');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    // Delete a task
    const deleteTask = useCallback(async (taskId) => {
        try {
            setLoading(true);
            setError(null);
            await taskService.deleteTask(taskId);

            // Remove from tasks list
            setTasks(prevTasks =>
                prevTasks.filter(task => task._id !== taskId)
            );

            // Clear current task if it's the one being deleted
            if (currentTask && currentTask._id === taskId) {
                setCurrentTask(null);
            }

            toast.success('Task deleted successfully!');
            return true;
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to delete task');
            toast.error('Failed to delete task');
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    // Add a comment to a task
    const addComment = useCallback(async (taskId, comment) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.addComment(taskId, comment);

            // Update current task if it's the one being modified
            if (currentTask && currentTask._id === taskId) {
                setCurrentTask(data);
            }

            toast.success('Comment added successfully!');
            return data;
        } catch (error) {
            console.error(`Error adding comment to task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to add comment');
            toast.error('Failed to add comment');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    // Upload attachment to a task
    const uploadAttachment = useCallback(async (taskId, file) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.uploadAttachment(taskId, file);

            // Update current task if it's the one being modified
            if (currentTask && currentTask._id === taskId) {
                setCurrentTask(data);
            }

            toast.success('File uploaded successfully!');
            return data;
        } catch (error) {
            console.error(`Error uploading file to task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to upload file');
            toast.error('Failed to upload file');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    // Delete attachment from a task
    const deleteAttachment = useCallback(async (taskId, attachmentId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskService.deleteAttachment(taskId, attachmentId);

            // Update current task if it's the one being modified
            if (currentTask && currentTask._id === taskId) {
                setCurrentTask(data);
            }

            toast.success('Attachment deleted successfully!');
            return data;
        } catch (error) {
            console.error(`Error deleting attachment from task ${taskId}:`, error);
            setError(error.response?.data?.message || 'Failed to delete attachment');
            toast.error('Failed to delete attachment');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentTask]);

    // Memoize context value
    const contextValue = useMemo(() => ({
        tasks,
        currentTask,
        loading,
        error,
        fetchTasks,
        fetchTasksByProject,
        fetchTasksByUser,
        fetchTask,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        uploadAttachment,
        deleteAttachment
    }), [
        tasks,
        currentTask,
        loading,
        error,
        fetchTasks,
        fetchTasksByProject,
        fetchTasksByUser,
        fetchTask,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        uploadAttachment,
        deleteAttachment
    ]);

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};

// Custom hook to use the task context
export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
}; 