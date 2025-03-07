import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import TaskCard from './TaskCard';
import { useTask } from '../../context/TaskContext';

/**
 * TaskBoard component for displaying tasks in a kanban board
 * @param {string} projectId - Project ID to display tasks for
 * @param {Function} onAddTask - Function to handle adding a new task
 * @param {Function} onEditTask - Function to handle editing a task
 * @param {Function} onDeleteTask - Function to handle deleting a task
 */
const TaskBoard = ({ projectId, onAddTask, onEditTask, onDeleteTask }) => {
    const { tasks, loading, fetchTasksByProject, updateTask } = useTask();
    const [columns, setColumns] = useState({
        'To-Do': [],
        'In Progress': [],
        'Completed': []
    });

    // Fetch tasks when projectId changes
    useEffect(() => {
        if (projectId) {
            fetchTasksByProject(projectId);
        }
    }, [projectId, fetchTasksByProject]);

    // Organize tasks into columns when tasks change
    useEffect(() => {
        if (tasks && tasks.length > 0) {
            const newColumns = {
                'To-Do': [],
                'In Progress': [],
                'Completed': []
            };

            tasks.forEach(task => {
                if (newColumns[task.status]) {
                    newColumns[task.status].push(task);
                } else {
                    newColumns['To-Do'].push(task);
                }
            });

            setColumns(newColumns);
        }
    }, [tasks]);

    // Handle drag end
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Return if dropped outside a droppable area
        if (!destination) return;

        // Return if dropped in the same position
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        // Find the task that was dragged
        const taskId = draggableId;
        const task = tasks.find(t => t._id === taskId);

        if (!task) return;

        // Update task status if moved to a different column
        if (source.droppableId !== destination.droppableId) {
            const newStatus = destination.droppableId;

            // Update task in the backend
            updateTask(taskId, { ...task, status: newStatus });

            // Update local state
            const sourceColumn = [...columns[source.droppableId]];
            const destColumn = [...columns[destination.droppableId]];
            const [removed] = sourceColumn.splice(source.index, 1);
            removed.status = newStatus;
            destColumn.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn
            });
        } else {
            // Reorder within the same column
            const column = [...columns[source.droppableId]];
            const [removed] = column.splice(source.index, 1);
            column.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: column
            });
        }
    };

    // Render loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Grid container spacing={2}>
                {Object.keys(columns).map(columnId => (
                    <Grid item xs={12} md={4} key={columnId}>
                        <Paper
                            sx={{
                                p: 2,
                                height: '100%',
                                backgroundColor: theme =>
                                    columnId === 'To-Do'
                                        ? theme.palette.grey[50]
                                        : columnId === 'In Progress'
                                            ? theme.palette.primary.light + '10'
                                            : theme.palette.success.light + '10'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">{columnId}</Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {columns[columnId].length} {columns[columnId].length === 1 ? 'task' : 'tasks'}
                                </Typography>
                            </Box>

                            {columnId === 'To-Do' && (
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={onAddTask}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    Add Task
                                </Button>
                            )}

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <Box
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`task-column ${snapshot.isDraggingOver ? 'drop-active' : ''}`}
                                        sx={{ minHeight: 300 }}
                                    >
                                        {columns[columnId].map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={snapshot.isDragging ? 'dragging' : ''}
                                                    >
                                                        <TaskCard
                                                            task={task}
                                                            onEdit={onEditTask}
                                                            onDelete={onDeleteTask}
                                                            isDraggable={true}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </DragDropContext>
    );
};

export default TaskBoard; 