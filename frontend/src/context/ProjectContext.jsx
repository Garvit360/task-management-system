import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import projectService from '../services/projectService';

// Create context
const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch all projects
    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjects();
            setProjects(data);
            return data;
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError(error.message || 'Failed to fetch projects');
            toast.error('Failed to fetch projects');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch single project by ID
    const fetchProject = useCallback(async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjectById(projectId);
            setProject(data);
            return data;
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            setError(error.message || 'Failed to fetch project');
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
            setProjects(prev => [...prev, data]);
            toast.success('Project created successfully');
            return data;
        } catch (error) {
            console.error('Error creating project:', error);
            setError(error.message || 'Failed to create project');
            toast.error('Failed to create project');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update an existing project
    const updateProject = useCallback(async (projectId, projectData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.updateProject(projectId, projectData);

            // Update local state
            setProject(data);
            setProjects(prev =>
                prev.map(p => p._id === projectId ? data : p)
            );

            toast.success('Project updated successfully');
            return data;
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            setError(error.message || 'Failed to update project');
            toast.error('Failed to update project');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete a project
    const deleteProject = useCallback(async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            await projectService.deleteProject(projectId);

            // Update local state
            setProjects(prev => prev.filter(p => p._id !== projectId));

            toast.success('Project deleted successfully');
            navigate('/projects');
            return true;
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            setError(error.message || 'Failed to delete project');
            toast.error('Failed to delete project');
            return false;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Add member to a project
    const addMemberToProject = useCallback(async (projectId, email) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.addMember(projectId, { email });

            // Update local state
            setProject(data);
            setProjects(prev =>
                prev.map(p => p._id === projectId ? data : p)
            );

            toast.success('Member added to project');
            return data;
        } catch (error) {
            console.error(`Error adding member to project ${projectId}:`, error);
            setError(error.message || 'Failed to add member');
            toast.error('Failed to add member to project');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Remove member from a project
    const removeMemberFromProject = useCallback(async (projectId, userId) => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.removeMember(projectId, userId);

            // Update local state
            setProject(data);
            setProjects(prev =>
                prev.map(p => p._id === projectId ? data : p)
            );

            toast.success('Member removed from project');
            return data;
        } catch (error) {
            console.error(`Error removing member from project ${projectId}:`, error);
            setError(error.message || 'Failed to remove member');
            toast.error('Failed to remove member from project');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoize context value
    const contextValue = useMemo(() => ({
        projects,
        project,
        loading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addMemberToProject,
        removeMemberFromProject
    }), [
        projects,
        project,
        loading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject,
        addMemberToProject,
        removeMemberFromProject
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