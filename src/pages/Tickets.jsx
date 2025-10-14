import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Fade,
  Snackbar,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import useUser from '../context/useUser';
import { useTickets } from '../hooks/useTickets';
import { userAPI } from '../services/api';
import {
  filterTickets,
  formatTicketData,
  prepareTicketPayload,
  validateTicketData,
  createTempFile,
  downloadTempFile,
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  getPriorityIcon,
} from '../utils/ticketUtils';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketTable from '../components/tickets/TicketTable';
import TicketCard from '../components/tickets/TicketCard';
import {
  ErrorDialog,
  SuccessDialog,
  DeleteDialog,
  NewTicketDialog,
  ViewTicketDialog,
  EditTicketDialog
} from '../components/tickets/TicketDialogs';
import PageHeader from '../components/layout/PageHeader';

// Initial ticket state
const initialTicketState = {
  title: '', 
  description: '', 
  priority: 'Medium', 
  status: 'pending',
  sendTo: '',
  due_date: '',
  departmentId: '', 
  desired_action: '',
  remarks: ''
};

const Tickets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { user } = useUser();
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  
  // Custom hook for ticket management
  const {
    tickets,
    assignedTickets,
    forwardedTickets,
    loading,
    actionLoading,
    departments,
    users,
    createTicket,
    updateTicket,
    deleteTicket,
    loadTicketFiles,
    uploadTicketFile,
    deleteTicketFile,
    downloadTicketFile,
    getTicketFiles,
    addComment,
    loadComments,
    deleteComment,
    refreshTickets,
  } = useTickets();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [newTicket, setNewTicket] = useState(initialTicketState);
  const [newTicketFiles, setNewTicketFiles] = useState([]);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editingTicketFiles, setEditingTicketFiles] = useState([]);
  const [fileOperationsCount, setFileOperationsCount] = useState(0); // Track net file operations (+1 for upload, -1 for delete)
  const [ticketToDelete, setTicketToDelete] = useState(null);
  
  // Dialog states
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [sendToUsers, setSendToUsers] = useState(users);
  const [viewTicketDialogOpen, setViewTicketDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState({ open: false, message: '' });
  const [dialogSuccess, setDialogSuccess] = useState({ open: false, message: '' });
  
  // User info
  const isDepartmentHead = user?.role === 'department_head' || user?.role === 'Department Head';
  const userId = user?.id;

  // Filter tickets based on current state
  const filteredTickets = filterTickets(tickets, assignedTickets, forwardedTickets, searchQuery, filter, priorityFilter, activeTab, userId);
  
  // Handle URL parameter for opening specific ticket
  useEffect(() => {
    if (ticketId && (tickets.length > 0 || assignedTickets.length > 0 || forwardedTickets.length > 0)) {
      // Find the ticket by ID in all ticket arrays
      const allTickets = [...tickets, ...assignedTickets, ...forwardedTickets];
      const ticket = allTickets.find(t => t.id === ticketId);
      
      if (ticket) {
        setViewingTicket(ticket);
        setViewTicketDialogOpen(true);
      } else {
        // Ticket not found, navigate back to tickets list
        navigate('/app/tickets');
      }
    }
  }, [ticketId, tickets, assignedTickets, forwardedTickets, navigate]);

  // When opening New Ticket, ensure Admins are available in Send To
  useEffect(() => {
    const loadAdminsForSendTo = async () => {
      try {
        // Start with existing users from hook
        const baseUsers = Array.isArray(users) ? users : [];
        // Fetch admins (if backend supports role filtering)
        let admins = [];
        try {
          const res = await userAPI.getAll({ role: 'admin' });
          admins = res.data || [];
        } catch (_) {
          // Fallback: rely on existing users only
          admins = baseUsers.filter(u => (u.role || '').toLowerCase() === 'admin');
        }
        // Merge unique by id
        const merged = [...baseUsers];
        admins.forEach(a => {
          if (!merged.some(u => u.id === a.id)) merged.push(a);
        });
        // Exclude current user
        const filtered = merged.filter(u => u.id !== userId);
        setSendToUsers(filtered);
      } catch {
        // On error, still provide existing users excluding self
        const baseUsers = Array.isArray(users) ? users : [];
        setSendToUsers(baseUsers.filter(u => u.id !== userId));
      }
    };
    if (isNewTicketDialogOpen) {
      loadAdminsForSendTo();
    }
  }, [isNewTicketDialogOpen, users, userId]);

  // Reset form state
  const resetNewTicketForm = useCallback(() => {
    setNewTicket(initialTicketState);
    setNewTicketFiles([]);
  }, []);

  // Event handlers
  const handleNewTicketChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    try {
      // Define allowed file types for tickets (PDF and images only)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
      ];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setDialogError({ open: true, message: 'Only PDF and image files are allowed.' });
        return;
      }

      // Validate file size (10MB max)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        setDialogError({ open: true, message: 'File size must be less than 10MB.' });
        return;
      }

      // Check file count (5 max)
      if (newTicketFiles.length >= 5) {
        setDialogError({ open: true, message: 'Maximum 5 files allowed.' });
        return;
      }

      const tempFile = createTempFile(file, user);
      setNewTicketFiles(prev => [...prev, tempFile]);
    } catch (err) {
      setDialogError({ open: true, message: 'Failed to prepare file for upload.' });
    }
  }, [user, newTicketFiles.length]);

  const handleFileDelete = useCallback(async (fileId) => {
    try {
      setNewTicketFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      setDialogError({ open: true, message: 'Failed to remove file.' });
    }
  }, []);

  const handleFileDownload = useCallback(async (fileId) => {
    try {
      const file = newTicketFiles.find(f => f.id === fileId);
      downloadTempFile(file);
    } catch (err) {
      setDialogError({ open: true, message: 'Failed to download file.' });
    }
  }, [newTicketFiles]);

  const handleAddTicket = useCallback(async () => {
    const errors = validateTicketData(newTicket, false);
    if (errors.length > 0) {
      setDialogError({ open: true, message: errors[0] });
      return;
    }

    try {
      const ticketPayload = prepareTicketPayload(newTicket, isDepartmentHead, user);
      const result = await createTicket(ticketPayload, newTicketFiles);
      
      if (result.success) {
        resetNewTicketForm();
        setIsNewTicketDialogOpen(false);
        setDialogSuccess({ open: true, message: 'Ticket created successfully!' });
      } else {
        setDialogError({ open: true, message: result.error });
      }
    } catch (err) {
      setDialogError({ open: true, message: err.message || 'Failed to create ticket. Please try again.' });
    }
  }, [newTicket, newTicketFiles, isDepartmentHead, user, createTicket, resetNewTicketForm]);

  const handleDeleteTicket = useCallback(async (ticketId) => {
    try {
      const result = await deleteTicket(ticketId);
      
      if (result.success) {
        setDeleteDialogOpen(false);
        setTicketToDelete(null);
        setDialogSuccess({ open: true, message: 'Ticket deleted successfully!' });
      } else {
        setDialogError({ open: true, message: result.error || 'Failed to delete ticket' });
      }
    } catch (err) {
      console.error('Delete ticket error:', err);
      setDialogError({ open: true, message: err.message || 'Failed to delete ticket. Please try again.' });
    }
  }, [deleteTicket]);

  const handleViewTicket = useCallback(async (ticket) => {
    setViewingTicket(ticket);
    await loadTicketFiles(ticket.id);
    setViewTicketDialogOpen(true);
  }, [loadTicketFiles]);

  const handleEditTicket = useCallback(async (ticket) => {
    const formattedTicket = formatTicketData(ticket);
    setEditingTicket(formattedTicket);
    
    // Reset file operations counter when opening edit dialog
    setFileOperationsCount(0);
    
    // Load existing files for this ticket
    try {
      const files = await loadTicketFiles(ticket.id);
      setEditingTicketFiles(Array.isArray(files) ? files : []);
    } catch (err) {
      console.error('Error loading ticket files:', err);
      setEditingTicketFiles([]);
    }
    
    setIsEditDialogOpen(true);
  }, [loadTicketFiles]);

  const handleEditTicketChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditingTicket(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleUpdateTicket = useCallback(async () => {
    const errors = validateTicketData(editingTicket, true); // Pass true for isUpdate
    if (errors.length > 0) {
      setDialogError({ open: true, message: errors[0] });
      return;
    }

    try {
      const ticketPayload = prepareTicketPayload(editingTicket, isDepartmentHead, user);
      const result = await updateTicket(ticketPayload);
      
      if (result.success) {
        // Upload any remaining temp files
        const tempFiles = editingTicketFiles.filter(f => f.id.startsWith('temp-'));
        if (tempFiles.length > 0 && editingTicket?.id) {
          try {
            for (const tempFile of tempFiles) {
              await uploadTicketFile(tempFile.file, editingTicket.id);
            }
          } catch (fileError) {
            console.error('Error uploading temp files:', fileError);
            // Don't fail the entire update if file upload fails
          }
        }
        
        setIsEditDialogOpen(false);
        setEditingTicket(null);
        setEditingTicketFiles([]);
        setDialogSuccess({ open: true, message: 'Ticket updated successfully!' });
      } else {
        setDialogError({ open: true, message: result.error });
      }
    } catch (err) {
      setDialogError({ open: true, message: err.message || 'Failed to update ticket. Please try again.' });
    }
  }, [editingTicket, editingTicketFiles, isDepartmentHead, user, updateTicket, uploadTicketFile]);

  const handleRefreshTickets = useCallback(async () => {
    try {
      await refreshTickets();
    } catch (err) {
      console.error('Error refreshing tickets:', err);
    }
  }, [refreshTickets]);

  // File handling for edit mode
  const handleEditFileUpload = useCallback(async (file) => {
    try {
      // Define allowed file types for tickets (PDF and images only)
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
      ];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setDialogError({ open: true, message: 'Only PDF and image files are allowed.' });
        return;
      }

      // Validate file size (10MB max)
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        setDialogError({ open: true, message: 'File size must be less than 10MB.' });
        return;
      }

      // Check file count (5 max)
      if (editingTicketFiles.length >= 5) {
        setDialogError({ open: true, message: 'Maximum 5 files allowed.' });
        return;
      }

      // If we have an editing ticket with an ID, upload the file directly
      if (editingTicket?.id) {
        await uploadTicketFile(file, editingTicket.id);
        // Refresh the files list
        const files = await loadTicketFiles(editingTicket.id);
        setEditingTicketFiles(Array.isArray(files) ? files : []);
      } else {
        // For new tickets or tickets without ID, create temp file
        const tempFile = createTempFile(file, user);
        setEditingTicketFiles(prev => [...prev, tempFile]);
      }
      
      // Increment file operations counter (upload = +1)
      setFileOperationsCount(prev => prev + 1);
    } catch (err) {
      console.error('Error uploading file:', err);
      setDialogError({ open: true, message: 'Failed to upload file.' });
    }
  }, [editingTicket, editingTicketFiles.length, user, uploadTicketFile, loadTicketFiles]);

  const handleEditFileDelete = useCallback(async (fileId) => {
    try {
      // If we have an editing ticket with an ID, delete the file from server
      if (editingTicket?.id) {
        await deleteTicketFile(editingTicket.id, fileId);
        // Refresh the files list
        const files = await loadTicketFiles(editingTicket.id);
        setEditingTicketFiles(Array.isArray(files) ? files : []);
      } else {
        // For temp files, just remove from state
        setEditingTicketFiles(prev => prev.filter(f => f.id !== fileId));
      }
      
      // Decrement file operations counter (delete = -1)
      setFileOperationsCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting file:', err);
      setDialogError({ open: true, message: 'Failed to delete file.' });
    }
  }, [editingTicket, deleteTicketFile, loadTicketFiles]);

  const handleEditFileDownload = useCallback(async (fileId) => {
    try {
      // If we have an editing ticket with an ID, download from server
      if (editingTicket?.id) {
        await downloadTicketFile(editingTicket.id, fileId);
      } else {
        // For temp files, use local download
        const file = editingTicketFiles.find(f => f.id === fileId);
        downloadTempFile(file);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setDialogError({ open: true, message: 'Failed to download file.' });
    }
  }, [editingTicket, editingTicketFiles, downloadTicketFile]);

  // File handling for view mode
  const handleViewTicketFileDelete = useCallback(async (fileId) => {
    try {
      await deleteTicketFile(viewingTicket.id, fileId);
      setDialogSuccess({ open: true, message: 'File deleted successfully!' });
    } catch (err) {
      setDialogError({ open: true, message: 'Failed to delete file.' });
    }
  }, [viewingTicket, deleteTicketFile]);

  const handleViewTicketFileDownload = useCallback(async (fileId) => {
    try {
      await downloadTicketFile(viewingTicket.id, fileId);
    } catch (err) {
      setDialogError({ open: true, message: 'Failed to download file.' });
    }
  }, [viewingTicket, downloadTicketFile]);

  const handleDelete = useCallback((ticket) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  }, []);

  // Dialog close handlers
  const handleCloseErrorDialog = useCallback(() => {
    setDialogError({ open: false, message: '' });
  }, []);

  const handleCloseSuccessDialog = useCallback(() => {
    setDialogSuccess({ open: false, message: '' });
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleCloseNewTicketDialog = useCallback(() => {
    setIsNewTicketDialogOpen(false);
  }, []);

  const handleCloseViewTicketDialog = useCallback(() => {
    setViewTicketDialogOpen(false);
    setViewingTicket(null);
    // If we came from a URL parameter, navigate back to tickets list
    if (ticketId) {
      navigate('/app/tickets');
    }
  }, [ticketId, navigate]);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setFileOperationsCount(0); // Reset file operations counter when closing dialog
  }, []);

  // Real-time updates
  useEffect(() => {
    const handleRealtime = () => { 
      refreshTickets();
    };
    window.addEventListener('ticket_update', handleRealtime);
    window.addEventListener('new_comment', handleRealtime);
    window.addEventListener('notification', handleRealtime);
    window.addEventListener('user_update', handleRealtime);
    window.addEventListener('task_update', handleRealtime);
    return () => {
      window.removeEventListener('ticket_update', handleRealtime);
      window.removeEventListener('new_comment', handleRealtime);
      window.removeEventListener('notification', handleRealtime);
      window.removeEventListener('user_update', handleRealtime);
      window.removeEventListener('task_update', handleRealtime);
    };
  }, [refreshTickets]);

  if (loading) {
    return (
      <LoadingSpinner 
        message="Loading tickets..." 
        size="large"
      />
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
        title="Tickets Management" 
        subtitle="Track and manage support tickets and requests for your department"
        emoji="🎫"
        color="primary"
        onRefresh={handleRefreshTickets}
        actionButton={{
          text: 'New Ticket',
          icon: <AddIcon />,
          onClick: () => setIsNewTicketDialogOpen(true),
          disabled: actionLoading,
        }}
      />

      {/* Error Dialog */}
      <ErrorDialog 
        open={dialogError.open} 
        message={dialogError.message} 
        onClose={handleCloseErrorDialog} 
      />

      {/* Success Dialog */}
      <SuccessDialog 
        open={dialogSuccess.open} 
        message={dialogSuccess.message} 
        onClose={handleCloseSuccessDialog} 
      />

      {/* Scrollable Content */}
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: 0, 
        overflowY: 'auto',
      }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Filters */}
            <TicketFilters
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filter={filter}
              setFilter={setFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              isMobile={isMobile}
            />

            {/* Tickets List */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>
                {activeTab === 0 ? 'Sent Tickets' : activeTab === 1 ? 'Received Tickets' : 'Forwarded by Me'} ({filteredTickets.length})
              </Typography>
              {filteredTickets.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body1">
                    {tickets.length === 0 
                      ? 'No tickets found. Create your first ticket to get started.'
                      : 'No tickets match your current filters. Try adjusting your search criteria.'
                    }
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Desktop Table */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TicketTable
                      tickets={filteredTickets}
                      departments={departments}
                      users={users}
                      activeTab={activeTab}
                      onViewTicket={handleViewTicket}
                      onEditTicket={handleEditTicket}
                      onDeleteTicket={handleDelete}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      getPriorityColor={getPriorityColor}
                      getPriorityIcon={getPriorityIcon}
                    />
                  </Box>

                  {/* Mobile/Tablet Cards */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Grid container spacing={2}>
                      {filteredTickets.map((ticket) => (
                        <Grid item xs={12} key={ticket.id}>
                          <TicketCard
                            ticket={ticket}
                            departments={departments}
                            users={users}
                            activeTab={activeTab}
                            onViewTicket={handleViewTicket}
                            onEditTicket={handleEditTicket}
                            onDeleteTicket={handleDelete}
                            getPriorityColor={getPriorityColor}
                            getPriorityIcon={getPriorityIcon}
                            getStatusColor={getStatusColor}
                            getTicketFiles={getTicketFiles}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        ticket={ticketToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={() => handleDeleteTicket(ticketToDelete?.id)}
        loading={actionLoading}
      />

      {/* New Ticket Dialog */}
      <NewTicketDialog
        open={isNewTicketDialogOpen}
        onClose={handleCloseNewTicketDialog}
        newTicket={newTicket}
        onTicketChange={handleNewTicketChange}
        newTicketFiles={newTicketFiles}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
        onFileDownload={handleFileDownload}
        departments={departments}
        users={sendToUsers}
        onSubmit={handleAddTicket}
        loading={actionLoading}
        isMobile={isMobile}
        currentUserId={userId}
      />

      {/* View Ticket Dialog */}
      <ViewTicketDialog
        open={viewTicketDialogOpen}
        onClose={handleCloseViewTicketDialog}
        ticket={viewingTicket}
        departments={departments}
        users={users}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getPriorityColor={getPriorityColor}
        getPriorityIcon={getPriorityIcon}
        getTicketFiles={getTicketFiles}
        onRefresh={handleRefreshTickets}
        onFileDelete={handleViewTicketFileDelete}
        onFileDownload={handleViewTicketFileDownload}
        onEdit={handleEditTicket}
        isMobile={isMobile}
        addComment={addComment}
        loadComments={loadComments}
        deleteComment={deleteComment}
      />

      {/* Edit Ticket Dialog */}
      <EditTicketDialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        ticket={editingTicket}
        onTicketChange={handleEditTicketChange}
        editingTicketFiles={editingTicketFiles}
        onFileUpload={handleEditFileUpload}
        onFileDelete={handleEditFileDelete}
        onFileDownload={handleEditFileDownload}
        departments={departments}
        users={users}
        onSubmit={handleUpdateTicket}
        loading={actionLoading}
        fileOperationsCount={fileOperationsCount}
      />
    </Box>
  );
};

export default Tickets;