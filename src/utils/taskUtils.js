/**
 * Task utility functions
 */

import { getTicketMaturityColor, getTicketMaturityText } from './ticketUtils';

// Priority color mapping
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

// Status color mapping
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

// Status icon mapping (returns icon component name)
export const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return 'CheckCircle';
    case 'in_progress':
      return 'TrendingUp';
    case 'pending':
      return 'Schedule';
    default:
      return 'Task';
  }
};

// Format assignee name
export const formatAssigneeName = (assignee) => {
  if (!assignee) return 'Unassigned';
  
  return (assignee.firstName && assignee.lastName
    ? `${assignee.firstName} ${assignee.lastName}`
    : assignee.firstname && assignee.lastname
      ? `${assignee.firstname} ${assignee.lastname}`
      : assignee.username || assignee.email || assignee.id);
};

// Get next status in cycle
export const getNextStatus = (currentStatus) => {
  const statusCycle = {
    'pending': 'in_progress',
    'in_progress': 'completed',
    'completed': 'pending'
  };
  return statusCycle[currentStatus] || 'pending';
};

// Get next priority in cycle
export const getNextPriority = (currentPriority) => {
  const priorityCycle = {
    'low': 'medium',
    'medium': 'high',
    'high': 'low'
  };
  return priorityCycle[currentPriority] || 'medium';
};

// Task maturity adapters (reuse ticket utils)
export const getTaskMaturityColor = (task) => {
  return getTicketMaturityColor({
    ...task,
    due_date: task.dueDate || task.due_date,
    created_at: task.createdAt || task.created_at,
  });
};

export const getTaskMaturityText = (task) => {
  return getTicketMaturityText({
    ...task,
    due_date: task.dueDate || task.due_date,
    created_at: task.createdAt || task.created_at,
  });
};

// Validate task form data
export const validateTaskForm = (formData) => {
  const errors = {};
  
  if (!formData.title || formData.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  }
  
  if (!formData.description || formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }
  
  if (!formData.dueDate) {
    errors.dueDate = 'Due date is required';
  }
  
  if (!formData.priority || !['low', 'medium', 'high'].includes(formData.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Initial form data
export const getInitialTaskFormData = () => ({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
  assignedToId: '',
  attachments: [],
  relatedTicketId: '',
  remarks: ''
});

// Build sanitized payload for API
export const buildTaskPayload = (formData, extras = {}) => {
  const payload = {
    title: formData.title?.trim(),
    description: formData.description?.trim(),
    priority: formData.priority,
    status: formData.status,
    dueDate: formData.dueDate || null,
    assignedToId: formData.assignedToId || null,
    relatedTicketId: formData.relatedTicketId || null,
    remarks: formData.remarks?.trim(),
    ...extras
  };

  // Remove empty string fields and undefined
  Object.keys(payload).forEach((key) => {
    if (payload[key] === '' || payload[key] === undefined) {
      delete payload[key];
    }
  });

  // Explicitly drop UI-only fields if present
  delete payload.attachments;

  return payload;
};

// Task status options
export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

// Task priority options
export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

// Filter options
export const TASK_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  ...TASK_STATUS_OPTIONS
]; 