/**
 * Report utility functions for web app
 * Mirrors desktop app functionality
 */

// Get report type color
export const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'ticket':
      return 'error';
    case 'task':
      return 'primary';
    case 'user':
      return 'secondary';
    case 'department':
      return 'info';
    case 'custom':
      return 'default';
    default:
      return 'default';
  }
};

// Get report type icon
export const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'ticket':
      return 'ConfirmationNumber';
    case 'task':
      return 'Assignment';
    case 'user':
      return 'Person';
    case 'department':
      return 'Business';
    case 'custom':
      return 'Build';
    default:
      return 'Assessment';
  }
};

// Get report type label
export const getTypeLabel = (type) => {
  switch (type?.toLowerCase()) {
    case 'ticket':
      return 'Ticket Report';
    case 'task':
      return 'Task Report';
    case 'user':
      return 'User Report';
    case 'department':
      return 'Department Report';
    case 'custom':
      return 'Custom Report';
    default:
      return 'Report';
  }
};

// Get status color
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'resolved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'in_progress':
    case 'in progress':
      return 'info';
    case 'declined':
    case 'overdue':
      return 'error';
    default:
      return 'default';
  }
};

// Get priority color
export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Get report target description
export const getReportTarget = (report) => {
  if (report.type === 'user' && report.parameters?.userName) {
    return `User: ${report.parameters.userName}`;
  }
  if (report.type === 'department' && report.parameters?.departmentName) {
    return `Department: ${report.parameters.departmentName}`;
  }
  if (report.type === 'custom') {
    return 'Custom Report';
  }
  return 'General Report';
};

// Filter reports by user role
export const filterReportsByUser = (reports, user) => {
  if (!user) return reports;
  
  if (user.role === 'admin') {
    return reports;
  }
  
  if (user.role === 'department_head') {
    return reports.filter(report => 
      report.parameters?.departmentId === user.departmentId ||
      report.createdBy === user.id
    );
  }
  
  return reports.filter(report => report.createdBy === user.id);
};

// Filter reports by criteria
export const filterReportsByCriteria = (reports, criteria) => {
  return reports.filter(report => {
    const matchesType = !criteria.type || criteria.type === 'all' || report.type === criteria.type;
    const matchesStatus = !criteria.status || criteria.status === 'all' || report.status === criteria.status;
    
    let matchesDate = true;
    if (criteria.startDate) {
      matchesDate = matchesDate && new Date(report.createdAt) >= new Date(criteria.startDate);
    }
    if (criteria.endDate) {
      matchesDate = matchesDate && new Date(report.createdAt) <= new Date(criteria.endDate);
    }
    
    return matchesType && matchesStatus && matchesDate;
  });
};

// Get reports for specific tab
export const getTabReports = (reports, tabIndex, user) => {
  const filteredReports = filterReportsByUser(reports, user);
  
  switch (tabIndex) {
    case 0: // All Reports
      return filteredReports;
    case 1: { // Recent
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return filteredReports.filter(report => 
        new Date(report.createdAt) >= oneWeekAgo
      );
    }
    case 2: // Department Summary
      return filteredReports.filter(report => report.type === 'department');
    default:
      return filteredReports;
  }
};

// Get initial new report object
export const getInitialNewReport = (departments = []) => ({
  title: '',
  description: '',
  type: 'task',
  parameters: {
    startDate: '',
    endDate: '',
    departmentId: departments[0]?.id || '',
    userId: '',
    selectedFields: []
  }
});

// Reset new report
export const resetNewReport = (departments = []) => getInitialNewReport(departments);

// Custom report field options
export const CUSTOM_REPORT_FIELDS = {
  taskMetrics: [
    { key: 'totalTasks', label: 'Total Tasks' },
    { key: 'pendingTasks', label: 'Pending Tasks' },
    { key: 'inProgressTasks', label: 'In Progress Tasks' },
    { key: 'completedTasks', label: 'Completed Tasks' },
    { key: 'overdueTasks', label: 'Overdue Tasks' },
    { key: 'taskCompletionRate', label: 'Task Completion Rate' },
    { key: 'averageTaskCompletionTime', label: 'Average Task Completion Time' }
  ],
  ticketMetrics: [
    { key: 'totalTickets', label: 'Total Tickets' },
    { key: 'pendingTickets', label: 'Pending Tickets' },
    { key: 'inProgressTickets', label: 'In Progress Tickets' },
    { key: 'completedTickets', label: 'Completed Tickets' },
    { key: 'declinedTickets', label: 'Declined Tickets' },
    { key: 'ticketResolutionRate', label: 'Ticket Resolution Rate' },
    { key: 'averageTicketResolutionTime', label: 'Average Ticket Resolution Time' },
    { key: 'priorityDistribution', label: 'Priority Distribution' }
  ]
  // Removed departmentMetrics - not needed for custom reports
};

// Get all custom report fields
export const getAllCustomReportFields = () => {
  return [
    ...CUSTOM_REPORT_FIELDS.taskMetrics,
    ...CUSTOM_REPORT_FIELDS.ticketMetrics
    // Removed departmentMetrics
  ];
};

// Validate report parameters
export const validateReportParameters = (report) => {
  const errors = [];
  
  if (!report.title?.trim()) {
    errors.push('Report title is required');
  }
  
  if (!report.type) {
    errors.push('Report type is required');
  }
  
  // User selection validation is handled in the component, not here
  // The selectedUserId is passed separately and added to parameters during report creation
  
  // Department reports are automatically assigned to user's department
  // No validation needed for department selection
  
  if (report.type === 'custom' && (!report.parameters?.selectedFields || report.parameters.selectedFields.length === 0)) {
    errors.push('At least one field must be selected for custom reports');
  }
  
  return errors;
};
