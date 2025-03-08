import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for task-related performance optimizations
 * Provides memoization, debouncing, and other performance enhancements
 */
const useTaskOptimizations = () => {
    // Cached tasks by projectId
    const taskCache = useRef(new Map());
    // Debounce timers
    const debounceTimers = useRef({});

    /**
     * Debounce a function call
     * @param {Function} fn - Function to debounce
     * @param {string} key - Unique identifier for this debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    const debounce = useCallback((fn, key, delay = 300) => {
        return (...args) => {
            // Clear existing timer for this key
            if (debounceTimers.current[key]) {
                clearTimeout(debounceTimers.current[key]);
            }

            // Set new timer
            debounceTimers.current[key] = setTimeout(() => {
                fn(...args);
                delete debounceTimers.current[key];
            }, delay);
        };
    }, []);

    /**
     * Store tasks in cache by project ID
     * @param {string} projectId - Project ID
     * @param {Array} tasks - Tasks to cache
     */
    const cacheTasks = useCallback((projectId, tasks) => {
        if (projectId && Array.isArray(tasks)) {
            taskCache.current.set(projectId, {
                data: tasks,
                timestamp: Date.now()
            });
        }
    }, []);

    /**
     * Get tasks from cache if available and not expired
     * @param {string} projectId - Project ID
     * @param {number} maxAge - Maximum age of cache in milliseconds
     * @returns {Array|null} - Cached tasks or null if cache miss
     */
    const getCachedTasks = useCallback((projectId, maxAge = 30000) => {
        const cached = taskCache.current.get(projectId);

        if (cached && (Date.now() - cached.timestamp < maxAge)) {
            return cached.data;
        }

        return null;
    }, []);

    // Clear cache when component unmounts
    useEffect(() => {
        return () => {
            // Clear all debounce timers
            Object.keys(debounceTimers.current).forEach(key => {
                clearTimeout(debounceTimers.current[key]);
            });
        };
    }, []);

    return {
        debounce,
        cacheTasks,
        getCachedTasks
    };
};

export default useTaskOptimizations; 