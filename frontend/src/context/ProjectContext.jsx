import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import projectService from '../services/projectService';

// Create context
const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all projects
    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError(error.response?.data?.message || 'Failed to fetch projects');
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single project by ID
    const fetchProject = useCallback(async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProject(projectId);
            setCurrentProject(data);
            return data;
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            setError(error.response?.data?.message || 'Failed to fetch project');
            toast.error('Failed to fetch project details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new project
    const createProject = useCallback(async (projectData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.createProject(projectData);
            setProjects(prevProjects => [...prevProjects, data]);
            toast.success('Project created successfully!');
            return data;
        } catch (error) {
            console.error('Error creating project:', error);
            setError(error.response?.data?.message || 'Failed to create project');
            toast.error('Failed to create project');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a project
    const updateProject = useCallback(async (projectId, projectData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.updateProject(projectId, projectData);
            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project._id === projectId ? data : project
                )
            );

            if (currentProject && currentProject._id === projectId) {
                setCurrentProject(data);
            }

            toast.success('Project updated successfully!');
            return data;
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            setError(error.response?.data?.message || 'Failed to update project');
            toast.error('Failed to update project');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentProject]);

    // Delete a project
    const deleteProject = useCallback(async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            await projectService.deleteProject(projectId);

            setProjects(prevProjects =>
                prevProjects.filter(project => project._id !== projectId)
            );

            if (currentProject && currentProject._id === projectId) {
                setCurrentProject(null);
            }

            toast.success('Project deleted successfully!');
            return true;
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            setError(error.response?.data?.message || 'Failed to delete project');
            toast.error('Failed to delete project');
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentProject]);

    // Add a member to project
    const addProjectMember = useCallback(async (projectId, userId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.addProjectMember(projectId, userId);

            // Update projects list
            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project._id === projectId ? data : project
                )
            );

            // Update current project if it's the one being modified
            if (currentProject && currentProject._id === projectId) {
                setCurrentProject(data);
            }

            toast.success('Member added to project successfully!');
            return data;
        } catch (error) {
            console.error(`Error adding member to project ${projectId}:`, error);
            setError(error.response?.data?.message || 'Failed to add member to project');
            toast.error('Failed to add member to project');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentProject]);

    // Remove a member from project
    const removeProjectMember = useCallback(async (projectId, userId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.removeProjectMember(projectId, userId);

            // Update projects list
            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project._id === projectId ? data : project
                )
            );

            // Update current project if it's the one being modified
            if (currentProject && currentProject._id === projectId) {
                setCurrentProject(data);
            }

            toast.success('Member removed from project successfully!');
            return data;
        } catch (error) {
            console.error(`Error removing member from project ${projectId}:`, error);
            setError(error.response?.data?.message || 'Failed to remove member from project');
            toast.error('Failed to remove member from project');
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentProject]);

    // Memoize context value
    const contextValue = useMemo(() => ({
        projects,
        currentProject,
        loading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addProjectMember,
        removeProjectMember
    }), [
        projects,
        currentProject,
        loading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addProjectMember,
        removeProjectMember
    ]);

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

// Custom hook to use the project context
export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
}; 