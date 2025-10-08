/**
 * Custom hook for task management
 * Encapsulates all task-related state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { taskAPI, userAPI, ticketAPI } from '../services';
import { useParams, useNavigate } from 'react-router-dom';
import useUser from '../context/useUser';
import { buildTaskPayload } from '../utils/taskUtils';

export const useTasks = () => {
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();

  // Core state
  const [tasks, setTasks] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  
  // UI state
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Bulk operations state
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  
  // Loading states
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [updatingPriority, setUpdatingPriority] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');

  // Load tasks based on user role
  const loadTasks = useCallback(async () => {
    setLoadingState(true);
    try {
      let response;
      if (user?.role === 'department_head' && user?.departmentId) {
        response = await taskAPI.getAll({ departmentId: user.departmentId });
      } else {
        response = await taskAPI.getAll();
      }
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoadingState(false);
    }
  }, [user?.role, user?.departmentId]);

  // Load department users
  const loadDepartmentUsers = useCallback(async () => {
    if (user?.departmentId) {
      try {
        const res = await userAPI.getDepartmentUsers(user.departmentId);
        setDepartmentUsers(res.data);
      } catch (error) {
        console.error('Failed to load department users:', error);
        setDepartmentUsers([]);
      }
    }
  }, [user?.departmentId]);

  // Load pending tickets
  const loadPendingTickets = useCallback(async () => {
    if (user?.departmentId) {
      try {
        const res = await ticketAPI.getAll({ 
          departmentId: user.departmentId, 
          status: 'pending' 
        });
        setPendingTickets(Array.isArray(res.data) ? res.data : (res.data.tickets || []));
      } catch (error) {
        console.error('Failed to load pending tickets:', error);
        setPendingTickets([]);
      }
    }
  }, [user?.departmentId]);

  // Initialize data
  useEffect(() => {
    loadTasks();
    loadDepartmentUsers();
  }, [loadTasks, loadDepartmentUsers]);

  // Handle URL parameter for direct task access
  useEffect(() => {
    if (id && tasks.length > 0) {
      const foundTask = tasks.find(t => t.id === id);
      if (foundTask) {
        setSelectedTask(foundTask);
        setDetailsOpen(true);
      }
    }
  }, [id, tasks]);

  // Task operations
  const createTask = useCallback(async (taskData) => {
    setCreatingTask(true);
    try {
      const payload = buildTaskPayload(taskData, { departmentId: user.departmentId });
      const response = await taskAPI.create(payload);
      const newTask = response.data || response;
      
      // Upload files if any were attached
      if (taskData.attachments && taskData.attachments.length > 0) {
        try {
          for (const file of taskData.attachments) {
            await taskAPI.uploadAttachment(newTask.id, file);
          }
        } catch (fileError) {
          console.error('Error uploading files:', fileError);
          // Don't fail the entire task creation if file upload fails
        }
      }
      
      await loadTasks();
      setSuccessMessage('Task created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to create task. Please try again.';
      throw new Error(message);
    } finally {
      setTimeout(() => setCreatingTask(false), 1000);
    }
  }, [user.departmentId, loadTasks]);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      // Require remarks when updating (mirror tickets behavior)
      if (!taskData?.remarks || taskData.remarks.trim() === '') {
        throw new Error('Remarks are required when updating a task. Please provide remarks explaining the changes made.');
      }

      const payload = buildTaskPayload(taskData);
      await taskAPI.update(id, payload);
      
      // Upload files if any were attached during edit
      if (taskData.attachments && taskData.attachments.length > 0) {
        try {
          for (const file of taskData.attachments) {
            await taskAPI.uploadAttachment(id, file);
          }
        } catch (fileError) {
          console.error('Error uploading files during task update:', fileError);
          // Don't fail the entire task update if file upload fails
        }
      }
      
      // If task is linked to a ticket, update the ticket's status
      if (payload.relatedTicketId && payload.status) {
        await ticketAPI.updateStatus(payload.relatedTicketId, payload.status);
      }
      
      await loadTasks();
      setSuccessMessage('Task updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to update task';
      throw new Error(message);
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id) => {
    setCreatingTask(true);
    try {
      await taskAPI.delete(id);
      await loadTasks();
      setSuccessMessage('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to delete task';
      throw new Error(message);
    } finally {
      setTimeout(() => setCreatingTask(false), 1000);
    }
  }, [loadTasks]);

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    setUpdatingStatus(taskId);
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  }, [loadTasks]);

  const updateTaskPriority = useCallback(async (taskId, newPriority) => {
    setUpdatingPriority(taskId);
    try {
      await taskAPI.updatePriority(taskId, newPriority);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task priority:', error);
    } finally {
      setUpdatingPriority(null);
    }
  }, [loadTasks]);

  // Bulk operations
  const selectTask = useCallback((taskIdOrArray) => {
    // Allow clearing selection with array input
    if (Array.isArray(taskIdOrArray)) {
      setSelectedTasks(taskIdOrArray);
      return;
    }
    const taskId = taskIdOrArray;
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback((filteredTasks) => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  }, [selectedTasks.length]);

  const bulkUpdateStatus = useCallback(async (newStatus) => {
    setBulkUpdating(true);
    try {
      await Promise.all(selectedTasks.map(taskId => taskAPI.updateStatus(taskId, newStatus)));
      setSelectedTasks([]);
      await loadTasks();
    } catch (error) {
      console.error('Error updating bulk status:', error);
    } finally {
      setBulkUpdating(false);
    }
  }, [selectedTasks, loadTasks]);

  const bulkUpdatePriority = useCallback(async (newPriority) => {
    setBulkUpdating(true);
    try {
      await Promise.all(selectedTasks.map(taskId => taskAPI.updatePriority(taskId, newPriority)));
      setSelectedTasks([]);
      await loadTasks();
    } catch (error) {
      console.error('Error updating bulk priority:', error);
    } finally {
      setBulkUpdating(false);
    }
  }, [selectedTasks, loadTasks]);

  const bulkDeleteTasks = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      return;
    }
    setBulkUpdating(true);
    try {
      await Promise.all(selectedTasks.map(taskId => taskAPI.delete(taskId)));
      setSelectedTasks([]);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting bulk tasks:', error);
    } finally {
      setBulkUpdating(false);
    }
  }, [selectedTasks, loadTasks]);

  // Computed values
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const canUpdateTask = useCallback((task) => {
    return user && (
      user.role === 'admin' || 
      user.role === 'department_head' || 
      task.createdBy === user.id || 
      task.assignedToId === user.id
    );
  }, [user]);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedTask(null);
    if (id) {
      navigate('/app/tasks', { replace: true });
    }
  }, [id, navigate]);

  return {
    // State
    tasks,
    filteredTasks,
    departmentUsers,
    pendingTickets,
    loadingState,
    filter,
    searchQuery,
    selectedTask,
    detailsOpen,
    selectedTasks,
    bulkUpdating,
    updatingStatus,
    updatingPriority,
    creatingTask,
    successMessage,
    
    // Actions
    setFilter,
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setSuccessMessage,
    loadPendingTickets,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    selectTask,
    selectAllTasks,
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkDeleteTasks,
    closeDetails,
    
    // Computed
    canUpdateTask,
    
    // Utils
    user
  };
}; 