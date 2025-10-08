import { useState, useEffect, useCallback } from 'react';
import { reportsAPI, userAPI, departmentAPI } from '../services/api';
import { 
  filterReportsByUser, 
  filterReportsByCriteria, 
  getTabReports, 
  getInitialNewReport, 
  resetNewReport 
} from '../utils/reportUtils';

export const useReports = (currentUser = null) => {
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Snackbar message state
  const [message, setMessage] = useState(null);
  const [messageSeverity, setMessageSeverity] = useState('success'); // 'success' | 'error' | 'info' | 'warning'
  
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState(getInitialNewReport());
  
  // Filters and tabs
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Report view dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Action-specific loading
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);

  // Department summary state
  const [showDeptSummaryFilters, setShowDeptSummaryFilters] = useState(false);
  const [deptSummaryStartDate, setDeptSummaryStartDate] = useState('');
  const [deptSummaryEndDate, setDeptSummaryEndDate] = useState('');

  // Admin-specific state
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  // Use the passed user or fallback to state
  const [user, setUser] = useState(currentUser);
  const isAdmin = user?.role === 'admin' || user?.role === 'department_head';

  // Update user when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  // Load reports and admin data on mount
  useEffect(() => {
    loadReports();
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const [usersData, departmentsData] = await Promise.all([
        userAPI.getAll(),
        departmentAPI.getAll()
      ]);
      
      // Filter users to only show users from the current user's department
      const userDepartmentId = user?.departmentId || user?.department_id || user?.department?.id;
      const filteredUsers = (usersData.data || []).filter(u => 
        (u.departmentId || u.department_id || u.department?.id) === userDepartmentId
      );
      
      // Add current user to the list if they're not already included
      const currentUserInList = filteredUsers.find(u => u.id === user?.id);
      if (!currentUserInList && user?.id) {
        filteredUsers.unshift(user);
      }
      
      setUsers(filteredUsers);
      setDepartments(departmentsData.data || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadReports = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingReports) {
      return;
    }
    
    setIsLoadingReports(true);
    setLoading(true);
    try {
      const response = await reportsAPI.listReports();
      const data = Array.isArray(response.data) ? response.data : [];
      
      // Backend already filters reports based on user role and department
      // No additional frontend filtering needed
      
      // Remove duplicates based on ID and composite key (title+type+creator+parameters)
      const byId = new Map();
      data.forEach(r => byId.set(r.id, r));
      const byComposite = new Map();
      data.forEach(r => {
        const paramsKey = JSON.stringify(r.parameters || {});
        const key = `${r.title || r.name || ''}::${r.type || ''}::${r.createdBy || ''}::${paramsKey}`;
        const prev = byComposite.get(key);
        if (!prev || new Date(r.createdAt) > new Date(prev.createdAt)) {
          byComposite.set(key, r);
        }
      });
      const uniqueReports = Array.from(byComposite.values());
      
      // Only update state if we have different data to prevent unnecessary re-renders
      setReports(prevReports => {
        const prevKeys = new Set(prevReports.map(r => `${r.title || r.name || ''}::${r.type || ''}::${r.createdBy || ''}::${JSON.stringify(r.parameters || {})}`));
        const newKeys = new Set(uniqueReports.map(r => `${r.title || r.name || ''}::${r.type || ''}::${r.createdBy || ''}::${JSON.stringify(r.parameters || {})}`));

        if (prevKeys.size === newKeys.size && [...prevKeys].every(k => newKeys.has(k))) {
          return prevReports;
        }
        
        return uniqueReports;
      });
      
      setError(null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
      setIsLoadingReports(false);
    }
  }, [isLoadingReports]);

  const handleNewReportChange = (e) => {
    const { name, value } = e.target;
    setNewReport(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddReport = async () => {
    setIsCreatingReport(true);
    setError(null);
    try {
      // Validate required fields
      if (!newReport.title?.trim()) {
        setError('Report name is required.');
        setLoading(false);
        return;
      }

      // Ensure user data is available
      // Check for department ID in various possible formats
      const departmentId = user?.departmentId || user?.department_id || user?.department?.id;
      
      if (!departmentId) {
        setError('User information not available. Please refresh the page.');
        setLoading(false);
        return;
      }

      const reportData = {
        name: newReport.title.trim(),
        description: newReport.description || '',
        type: newReport.type,
        parameters: {
          ...newReport.parameters,
          departmentId: departmentId,
          // Only add userId if it's a user report
          ...(newReport.type === 'user' && selectedUserId && { userId: selectedUserId }),
          // Only add selectedDepartmentId if it's not department or ticket reports
          ...(newReport.type !== 'department' && newReport.type !== 'ticket' && selectedDepartmentId && { selectedDepartmentId })
        }
      };
      
      console.log('newReport.parameters:', newReport.parameters);
      console.log('selectedDepartmentId:', selectedDepartmentId);
      console.log('Sending report data:', reportData);
      await reportsAPI.createReport(reportData);
      await loadReports();
      setMessage('Report generated successfully');
      setMessageSeverity('success');
      setNewReport(getInitialNewReport());
      setIsNewReportDialogOpen(false);
      setSelectedUserId('');
      setSelectedDepartmentId('');
    } catch (error) {
      console.error('Error creating report:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Extract validation errors if available
      let errorMessage = 'Failed to create report.';
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation errors: ${validationErrors}`;
        console.error('Validation errors:', validationErrors);
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        console.error('Backend error:', error.response.data.error);
      }
      
      setError(errorMessage);
      setMessage(errorMessage);
      setMessageSeverity('error');
    } finally {
      setIsCreatingReport(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    setDeletingReportId(reportId);
    setError(null);
    try {
      await reportsAPI.deleteReport(reportId);
      await loadReports();
      setMessage('Report deleted successfully');
      setMessageSeverity('success');
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report.');
      setMessage('Failed to delete report.');
      setMessageSeverity('error');
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleViewReport = async (report) => {
    setReportLoading(true);
    setSelectedReport(report);
    setViewDialogOpen(true);
    
    try {
      const response = await reportsAPI.getReport(report.id);
      let fullReport = response.data;
      
      // If backend returns { report, data }, merge them
      if (response.data && response.data.report && response.data.data) {
        fullReport = { 
          ...response.data.report, 
          metrics: response.data.data,
          // Preserve filtersApplied from the data section
          filtersApplied: response.data.data.filtersApplied || response.data.report.filtersApplied
        };
      } else if (response.data && response.data.report) {
        fullReport = response.data.report;
      }
      
      setReportData(fullReport);
    } catch (error) {
      console.error('Error loading report details:', error);
      setError('Failed to load report details.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleEditReport = async (report) => {
    // Implementation for editing reports
    console.log('Edit report:', report);
  };

  const handleCloseNewReportDialog = () => {
    setIsNewReportDialogOpen(false);
    setNewReport(getInitialNewReport());
    setSelectedUserId('');
    setSelectedDepartmentId('');
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedReport(null);
    setReportData(null);
  };

  const handleDownloadReport = async (report, filename = null, format = 'pdf') => {
    try {
      const response = await reportsAPI.exportReport(report.id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Use provided filename or generate default
      if (filename) {
        link.setAttribute('download', filename);
      } else {
        const ext = format === 'excel' ? 'xlsx' : (format === 'pdf' ? 'pdf' : 'csv');
        link.setAttribute('download', `report-${report.id}.${ext}`);
      }
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report.');
    }
  };

  // Filter reports based on current criteria
  const filteredReports = reports.filter(report => {
    const matchesType = filterType === 'all' || (report.type?.toLowerCase() === filterType);
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    let matchesDate = true;
    if (filterStartDate) {
      matchesDate = matchesDate && new Date(report.createdAt) >= new Date(filterStartDate);
    }
    if (filterEndDate) {
      matchesDate = matchesDate && new Date(report.createdAt) <= new Date(filterEndDate);
    }
    
    return matchesType && matchesStatus && matchesDate;
  });

  // Get reports for current tab
  const tabReports = getTabReports(reports, activeTab, user);

  return {
    // State
    reports: filteredReports,
    tabReports,
    loading,
    error,
    isNewReportDialogOpen,
    newReport,
    activeTab,
    viewDialogOpen,
    selectedReport,
    reportData,
    reportLoading,
    isCreatingReport,
    deletingReportId,
    message,
    messageSeverity,
    isAdmin,
    users,
    departments,
    selectedUserId,
    selectedDepartmentId,
    showFilters,
    filterType,
    filterStatus,
    filterStartDate,
    filterEndDate,
    showDeptSummaryFilters,
    deptSummaryStartDate,
    deptSummaryEndDate,
    
    // Actions
    setActiveTab,
    setIsNewReportDialogOpen,
    handleNewReportChange,
    handleAddReport,
    handleDeleteReport,
    handleViewReport,
    handleEditReport,
    handleCloseNewReportDialog,
    handleCloseViewDialog,
    handleDownloadReport,
    setSelectedUserId,
    setSelectedDepartmentId,
    setShowFilters,
    setFilterType,
    setFilterStatus,
    setFilterStartDate,
    setFilterEndDate,
    setShowDeptSummaryFilters,
    setDeptSummaryStartDate,
    setDeptSummaryEndDate,
    loadReports,
    setUser,
    setMessage
  };
};
