// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format as MM/DD/YYYY for better readability
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format as MM/DD/YYYY HH:MM AM/PM
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'N/A';
  }
};

// Icon names for status and priority indicators

// Status color utilities
export const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
    case 'open':
      return 'warning';
    case 'in_progress':
    case 'in progress':
      return 'primary';
    case 'completed':
    case 'resolved':
      return 'success';
    case 'declined':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
    case 'open':
      return 'Schedule';
    case 'in_progress':
    case 'in progress':
      return 'Schedule';
    case 'completed':
    case 'resolved':
      return 'CheckCircle';
    case 'declined':
    case 'cancelled':
      return 'Error';
    default:
      return 'ConfirmationNumber';
  }
};

// Priority utilities
export const getPriorityColor = (priority) => {
  switch ((priority || '').toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'error';
    case 'medium':
    case 'normal':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

export const getPriorityIcon = (priority) => {
  switch ((priority || '').toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'PriorityHigh';
    case 'medium':
    case 'normal':
      return 'Remove';
    case 'low':
      return 'LowPriority';
    default:
      return 'Remove';
  }
};

// Ticket maturity utilities
export const getTicketMaturityColor = (ticket) => {
  const now = new Date();
  const createdDate = new Date(ticket.created_at || ticket.createdAt);
  const dueDate = ticket.due_date ? new Date(ticket.due_date) : null;
  const status = (ticket.status || '').toLowerCase();
  
  // If ticket is completed or declined, no maturity color needed
  if (status === 'completed' || status === 'resolved' || status === 'declined' || status === 'cancelled') {
    return null;
  }
  
  // If due date is past, automatically red
  if (dueDate && dueDate < now) {
    return 'error';
  }
  
  // Only calculate maturity for in_progress tickets
  if (status === 'in_progress' || status === 'in progress') {
    const hoursInProgress = (now - createdDate) / (1000 * 60 * 60);
    
    if (hoursInProgress <= 72) {
      return 'success'; // Green - within 72 hours
    } else if (hoursInProgress <= 72 + (3 * 24)) { // 72 hours + 3 days = 144 hours
      return 'warning'; // Orange - above 3 days
    } else {
      return 'error'; // Red - above 10 days (144 + 7*24 = 312 hours)
    }
  }
  
  // For pending tickets, check due date proximity
  if ((status === 'pending' || status === 'open') && dueDate) {
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      return 'error'; // Past due
    } else if (hoursUntilDue <= 24) {
      return 'error'; // Due within 24 hours
    } else if (hoursUntilDue <= 72) {
      return 'warning'; // Due within 3 days
    }
  }
  
  return null; // No maturity color
};

export const getTicketMaturityText = (ticket) => {
  const now = new Date();
  const createdDate = new Date(ticket.created_at || ticket.createdAt);
  const dueDate = ticket.due_date ? new Date(ticket.due_date) : null;
  const status = (ticket.status || '').toLowerCase();
  
  // If ticket is completed or declined, no maturity text
  if (status === 'completed' || status === 'resolved' || status === 'declined' || status === 'cancelled') {
    return null;
  }
  
  // If due date is past
  if (dueDate && dueDate < now) {
    const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
  }
  
  // For in_progress tickets
  if (status === 'in_progress' || status === 'in progress') {
    const hoursInProgress = (now - createdDate) / (1000 * 60 * 60);
    
    if (hoursInProgress <= 72) {
      return 'Fresh'; // Within 72 hours
    } else if (hoursInProgress <= 72 + (3 * 24)) {
      return 'Aging'; // Above 3 days
    } else {
      return 'Stale'; // Above 10 days
    }
  }
  
  // For pending tickets with due date
  if ((status === 'pending' || status === 'open') && dueDate) {
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilDue < 0) {
      const daysOverdue = Math.floor(Math.abs(hoursUntilDue) / 24);
      return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
    } else if (hoursUntilDue <= 24) {
      return 'Due Soon';
    } else if (hoursUntilDue <= 72) {
      return 'Due in 3 days';
    }
  }
  
  return null;
};

// Data filtering utilities
export const filterTickets = (tickets, assignedTickets, forwardedTickets, searchQuery, filter, priorityFilter, activeTab, userId) => {
  // Ensure tickets is an array
  const allTickets = Array.isArray(tickets) ? tickets : [];
  const assignedTicketsArray = Array.isArray(assignedTickets) ? assignedTickets : [];
  const forwardedTicketsArray = Array.isArray(forwardedTickets) ? forwardedTickets : [];
  
  const sentTickets = allTickets.filter(ticket => 
    ticket.ticketCreator?.id === userId || 
    ticket.created_by === userId || 
    ticket.createdBy === userId ||
    ticket.original_creator_id === userId
  );

  let currentTickets;
  switch (activeTab) {
    case 0: // Sent tickets - tickets created by the user
      currentTickets = sentTickets;
      break;
    case 1: // Received tickets - tickets assigned to or forwarded to the user (use assignedTickets from API)
      currentTickets = assignedTicketsArray;
      break;
    case 2: // Forwarded tickets - tickets that the user has forwarded to others
      // Use the forwarded tickets from the dedicated API endpoint
      console.log('Filtering forwarded tickets:', {
        forwardedTicketsArray,
        length: forwardedTicketsArray.length,
        userId
      });
      currentTickets = forwardedTicketsArray;
      break;
    default:
      currentTickets = sentTickets;
  }

  return currentTickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id?.toString().includes(searchQuery) ||
      (ticket.ticketCreator ? `${ticket.ticketCreator.firstname} ${ticket.ticketCreator.lastname}` : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.ticketAssignee ? `${ticket.ticketAssignee.firstname} ${ticket.ticketAssignee.lastname}` : '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (ticket.status || '').toLowerCase() === filter.toLowerCase();
    
    const matchesPriority = priorityFilter === 'all' || 
      (ticket.priority || '').toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesFilter && matchesPriority;
  });
};

// Data formatting utilities
export const formatTicketData = (ticket) => {
  // Format the date properly for the input field
  let formattedDueDate = '';
  if (ticket.due_date) {
    try {
      const date = new Date(ticket.due_date);
      if (!isNaN(date.getTime())) {
        formattedDueDate = date.toISOString().split('T')[0]; // Format as yyyy-MM-dd
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
  }

  return {
    id: ticket.id,
    title: ticket.title || '',
    description: ticket.description || '',
    priority: ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Medium',
    status: ticket.status || 'pending',
    due_date: formattedDueDate,
    departmentId: ticket.departmentId || ticket.department_id || '',
    sendTo: ticket.assignedTo || ticket.assigned_to || '',
    createdBy: ticket.createdBy || ticket.created_by || '',
    desired_action: ticket.desired_action || '',
    remarks: ticket.remarks || ''
  };
};

export const prepareTicketPayload = (ticketData, userRole, currentUser) => {
  const payload = {
    title: ticketData.title?.trim(),
    description: ticketData.description?.trim(),
    priority: (ticketData.priority || 'Medium').toLowerCase(),
    status: ticketData.status || 'pending',
    desired_action: ticketData.desired_action?.trim()
  };

  // Include ID if it exists (for updates)
  if (ticketData.id) {
    payload.id = ticketData.id;
  }

  if (ticketData.due_date) {
    payload.due_date = ticketData.due_date;
  }

  // Add remarks field for updates
  if (ticketData.remarks) {
    payload.remarks = ticketData.remarks;
  }

  // Add department_id - use selected department or user's department
  if (ticketData.departmentId) {
    payload.department_id = ticketData.departmentId;
  } else if (currentUser?.departmentId) {
    payload.department_id = currentUser.departmentId;
  }

  // Add sendTo field (replaces assignedTo)
  if (ticketData.sendTo) {
    payload.assigned_to = ticketData.sendTo;
  }

  return payload;
};

// Validation utilities
export const validateTicketData = (ticketData, isUpdate = false) => {
  const errors = [];

  if (!ticketData.title?.trim()) {
    errors.push('Ticket title is required.');
  }
  if (!ticketData.description?.trim()) {
    errors.push('Ticket description is required.');
  }
  if (!ticketData.priority) {
    errors.push('Please select a priority level.');
  }
  if (!ticketData.desired_action?.trim()) {
    errors.push('Desired action is required.');
  }
  if (!ticketData.sendTo) {
    errors.push('Please select who to send the ticket to.');
  }

  // Additional validation for updates
  if (isUpdate && !ticketData.id) {
    errors.push('Ticket ID is required for updates.');
  }
  if (isUpdate && !ticketData.remarks?.trim()) {
    errors.push('Remarks are required when updating a ticket. Please provide remarks explaining the changes made.');
  }

  return errors;
};

// File handling utilities
export const createTempFile = (file, user) => {
  return {
    id: `temp-${Date.now()}-${Math.random()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file: file, // Store the actual file object
    uploadedAt: new Date().toISOString(),
    uploadedBy: user.firstname + ' ' + user.lastname
  };
};

export const downloadTempFile = (file) => {
  if (file && file.file) {
    // Create a download link for the file
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get user display name
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  if (typeof user === 'string') return user;
  return `${user.firstname || user.firstName || ''} ${user.lastname || user.lastName || ''}`.trim() || 
         user.email || 
         user.username || 
         'Unknown User';
};

// Get department name
export const getDepartmentName = (departmentId, departments) => {
  if (!departmentId) return 'N/A';
  const department = departments.find(dept => dept.id === departmentId);
  return department ? department.name : departmentId;
};