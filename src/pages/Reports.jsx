import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Tabs,
  Tab,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useReports } from '../hooks/useReports';
import PageHeader from '../components/layout/PageHeader';
import ReportFilters from '../components/reports/ReportFilters';
import NewReportDialog from '../components/reports/NewReportDialog';
import ReportDetail from '../components/reports/ReportDetail';
import UserContext from '../context/UserContext';

const Reports = () => {
  const theme = useTheme();
  const { user } = React.useContext(UserContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  
  const {
    // State
    reports,
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
    users,
    selectedUserId,
    showFilters,
    filterType,
    filterStatus,
    filterStartDate,
    filterEndDate,
    
    // Actions
    setActiveTab,
    setIsNewReportDialogOpen,
    handleNewReportChange,
    handleAddReport,
    handleDeleteReport,
    handleViewReport,
    handleCloseNewReportDialog,
    handleCloseViewDialog,
    handleDownloadReport,
    setSelectedUserId,
    setShowFilters,
    setFilterType,
    setFilterStatus,
    setFilterStartDate,
    setFilterEndDate,
    setMessage
  } = useReports(user);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Don't render the component if user is not loaded yet
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleDeleteReportClick = (reportId) => {
    setConfirmDeleteId(reportId);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDeleteReport(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };


  // Helper functions for table display (matching desktop app)
  const getTypeColor = (type) => {
    const colors = {
      ticket: 'primary',
      task: 'secondary',
      user: 'success',
      department: 'warning',
      custom: 'info'
    };
    return colors[type] || 'default';
  };

  const getTypeIcon = (type) => {
    const icons = {
      ticket: '🎫',
      task: '📋',
      user: '👤',
      department: '🏢',
      custom: '📊'
    };
    return icons[type] || '📄';
  };

  const getTypeLabel = (type) => {
    const labels = {
      ticket: 'Ticket Report',
      task: 'Task Report',
      user: 'User Report',
      department: 'Department Report',
      custom: 'Custom Report'
    };
    return labels[type] || 'Report';
  };

  const getReportTarget = (report) => {
    const { type, parameters, title } = report;
    
    switch (type) {
      case 'user':
        return parameters?.userName || 
               extractFromTitle(title, 'User Report -') || 
               'User Report';
      case 'department':
        return parameters?.departmentName || 
               extractFromTitle(title, 'Department Report -') || 
               'Department Report';
      case 'task':
      case 'ticket':
        return parameters?.global ? 'All Departments' : 'Filtered';
      case 'custom':
        return 'Custom Scope';
      default:
        return 'N/A';
    }
  };

  const extractFromTitle = (title, pattern) => {
    if (!title || !title.includes(pattern)) return null;
    const match = title.match(new RegExp(`${pattern} (.+?) -`));
    return match ? match[1] : null;
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <PageHeader 
        title="Reports"
        subtitle="Generate and manage comprehensive reports"
        emoji="📊"
        color="secondary"
        actionButton={{
          icon: <AddIcon />,
          text: "Generate Report",
          onClick: () => setIsNewReportDialogOpen(true),
          disabled: loading
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filters and Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary" 
          textColor="primary" 
          variant="fullWidth"
                sx={{ 
            '& .MuiTab-root': { 
                  fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 48, sm: 56 }
            } 
          }}
        >
          <Tab label="All Reports" />
        </Tabs>
      </Paper>

      {/* Filtering UI */}
      <ReportFilters
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Reports List */}
      {reports.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No reports found
          </Typography>
          <Typography variant="body2">
            Generate your first report to get started.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Desktop Table View */}
          {!isMobile ? (
            <TableContainer component={Paper} sx={{ 
              borderRadius: 3, 
              boxShadow: 3, 
              overflowX: 'auto', 
              width: '100%', 
              maxWidth: '100vw', 
              bgcolor: 'background.paper',
            }}>
              <Table size="medium" sx={{ minWidth: { md: 0, lg: 900 }, width: '100%', tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <TableCell padding="checkbox" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 36, lg: 48 } }}>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 120, lg: 220 }, minWidth: 80 }}>Report</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 80, lg: 160 } }}>Generated By</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 80, lg: 160 } }}>Created</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, minWidth: { md: 60, lg: 80 } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report, idx) => (
                    <TableRow 
                      key={report.id}
                      hover 
                      sx={{ 
                        bgcolor: idx % 2 === 0 ? 'background.default' : 'background.paper', 
                        transition: 'background 0.2s', 
                        '&:hover': { 
                          bgcolor: 'action.hover' 
                        } 
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ px: { md: 0.5, lg: 2 }, width: { md: 36, lg: 48 } }} />
                      <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: { md: 22, lg: 32 }, height: { md: 22, lg: 32 }, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                          {getTypeIcon(report.type)}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ maxWidth: { md: 120, lg: 220 }, minWidth: 80, px: { md: 0.5, lg: 2 } }}>
                        <Tooltip title={report.title || report.name || 'Untitled Report'}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {report.title || report.name || 'Untitled Report'}
                          </Typography>
                        </Tooltip>
                        <Tooltip title={`ID: ${report.id}`}>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { md: '0.8rem', lg: '0.92rem' }, lineHeight: 1.4, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            ID: {report.id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                        <Tooltip title={`Target: ${getReportTarget(report)}`} arrow>
                          <span>
                            <Chip
                              label={getReportTarget(report)}
                              size="small"
                              color={getTypeColor(report.type)}
                              sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 70 }, justifyContent: 'center' }}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ maxWidth: { md: 80, lg: 160 }, px: { md: 0.5, lg: 2 } }}>
                        <Tooltip title={`Generated by: ${report.generatedBy || report.createdBy || 'Unknown'}`} arrow>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {report.generatedBy || report.createdBy || 'Unknown'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ maxWidth: { md: 80, lg: 160 }, px: { md: 0.5, lg: 2 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Tooltip title={new Date(report.createdAt).toLocaleString()} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: { md: '0.7rem', lg: '0.78rem' }, maxWidth: { md: 60, lg: 70 } }}>
                                {new Date(report.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: { md: '0.6rem', lg: '0.7rem' }, maxWidth: { md: 60, lg: 70 } }}>
                            {new Date(report.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: { md: 60, lg: 80 }, px: { md: 0.5, lg: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, flexWrap: 'wrap', justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
                            <Tooltip title="View Report">
                              <span>
                                <IconButton
                                  color="primary" 
                                  size="small"
                                  onClick={() => handleViewReport(report)}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Download PDF">
                              <span>
                                <IconButton 
                                  color="success" 
                                  size="small" 
                                  onClick={() => {
                                    const reportName = report.title || report.name || 'report';
                                    const safeName = reportName.replace(/[^a-zA-Z0-9]/g, '_');
                                    const filename = `${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
                                    handleDownloadReport(report, filename);
                                  }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete Report">
                              <span>
                                <IconButton 
                                  color="error" 
                                  size="small" 
                                  onClick={() => handleDeleteReportClick(report.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            /* Mobile Card View */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reports.map((report) => (
                <Paper 
                  key={report.id}
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    boxShadow: 1,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {getTypeIcon(report.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {report.title || report.name || 'Untitled Report'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {report.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={getTypeLabel(report.type)}
                      size="small"
                      color={getTypeColor(report.type)}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Target:</strong> {getReportTarget(report)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Generated By:</strong> {report.generatedBy || report.createdBy || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Report">
                      <IconButton
                        size="small"
                        onClick={() => handleViewReport(report)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const reportName = report.title || report.name || 'report';
                          const safeName = reportName.replace(/[^a-zA-Z0-9]/g, '_');
                          const filename = `${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
                          handleDownloadReport(report, filename);
                        }}
                        sx={{ color: theme.palette.success.main }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Report">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReportClick(report.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </>
      )}


      {/* New Report Dialog */}
      <NewReportDialog
        open={isNewReportDialogOpen}
        onClose={handleCloseNewReportDialog}
        newReport={newReport}
        onNewReportChange={handleNewReportChange}
        onAddReport={handleAddReport}
        loading={isCreatingReport}
        users={users}
        selectedUserId={selectedUserId}
        onSelectedUserIdChange={setSelectedUserId}
      />

      {/* Report View Dialog */}
      {viewDialogOpen && selectedReport && (
        <Dialog 
          open={viewDialogOpen} 
          onClose={handleCloseViewDialog} 
          maxWidth="lg" 
                    fullWidth
          PaperProps={{
            sx: { minHeight: '80vh' }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedReport.title || selectedReport.name || 'Report'}
                            </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generated on {new Date(selectedReport.createdAt).toLocaleDateString()}
                          </Typography>
                          </Box>
                        </Box>
            <IconButton onClick={handleCloseViewDialog} size="small">
              <CloseIcon />
                                  </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {reportLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                </Box>
            ) : (
              <ReportDetail 
                report={reportData || selectedReport} 
                onExport={handleDownloadReport} 
              />
                )}
              </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={handleCloseViewDialog}
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                // Generate filename based on report data (matching desktop app)
                const reportName = selectedReport.title || selectedReport.name || 'report';
                const safeName = reportName.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
                handleDownloadReport(selectedReport, filename);
              }}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Download PDF
            </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
            <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this report? This action cannot be undone.
          </Typography>
            </DialogContent>
            <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={!!deletingReportId}>
            {deletingReportId ? 'Deleting…' : 'Delete'}
          </Button>
            </DialogActions>
          </Dialog>

      {/* Snackbar for create/delete success and errors */}
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setMessage(null)} severity={messageSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;