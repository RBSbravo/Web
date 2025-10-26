import { useState, useEffect, useCallback } from 'react';
import { ticketAPI, userAPI, departmentAPI, commentAPI, fileAPI } from '../services/api';

export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [forwardedTickets, setForwardedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [ticketFiles, setTicketFiles] = useState({});
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const response = await ticketAPI.getAll();
      const ticketsData = response.data?.tickets || response.tickets || response.data || response || [];
      
      // Ensure ticketsData is an array before calling sort
      if (!Array.isArray(ticketsData)) {
        console.warn('Tickets data is not an array:', ticketsData);
        setTickets([]);
        return;
      }
      
      const sortedTickets = ticketsData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setTickets(sortedTickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setTickets([]);
    }
  }, []);

  const loadAssignedTickets = useCallback(async () => {
    try {
      const response = await ticketAPI.getAssignedTickets();
      const assignedData = response.data || response || [];
      
      // Ensure assignedData is an array before calling sort
      if (!Array.isArray(assignedData)) {
        console.warn('Assigned tickets data is not an array:', assignedData);
        setAssignedTickets([]);
        return;
      }
      
      const sortedAssignedTickets = assignedData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setAssignedTickets(sortedAssignedTickets);
    } catch (err) {
      console.error('Error loading assigned tickets:', err);
      setAssignedTickets([]);
    }
  }, []);

  const loadForwardedTickets = useCallback(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const currentUserId = currentUser?.id;
      
      if (!currentUserId) {
        setForwardedTickets([]);
        return;
      }
      
      // Use the new dedicated API endpoint for tickets forwarded by me
      const response = await ticketAPI.getTicketsForwardedByMe();
      const forwardedTickets = response.data?.tickets || response.tickets || response.data || response || [];
      
      // Sort by creation date (newest first)
      const sortedForwardedTickets = forwardedTickets.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      
      setForwardedTickets(sortedForwardedTickets);
    } catch (err) {
      console.error('Error loading forwarded-by-me tickets:', err);
      setForwardedTickets([]);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAll();
      const departmentsData = response.data || response || [];
      setDepartments(departmentsData);
    } catch (err) {
      console.error('Error loading departments:', err);
      setDepartments([]);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await userAPI.getAll();
      const usersData = response.data || response || [];
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([
        loadTickets(),
        loadAssignedTickets(),
        loadDepartments(),
        loadUsers()
      ]);
      // Load forwarded tickets separately to avoid circular dependency
      await loadForwardedTickets();
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loadTickets, loadAssignedTickets, loadDepartments, loadUsers, loadForwardedTickets]);

  const createTicket = useCallback(async (ticketData, files = []) => {
    setActionLoading(true);
    try {
      const response = await ticketAPI.create(ticketData);
      const newTicket = response.data || response;
      
      // Upload files if any were attached
      if (files && files.length > 0) {
        try {
          for (const tempFile of files) {
            // Check if it's a temp file with a file object
            if (tempFile.file) {
              await ticketAPI.uploadAttachment(newTicket.id, tempFile.file);
            } else {
              // Handle case where file is passed directly
              await ticketAPI.uploadAttachment(newTicket.id, tempFile);
            }
          }
        } catch (fileError) {
          console.error('Error uploading files:', fileError);
          // Don't fail the entire ticket creation if file upload fails
        }
      }
      
      setTickets(prevTickets => [newTicket, ...prevTickets]);
      return { success: true, ticket: newTicket };
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to create ticket.' };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (ticketData) => {
    setActionLoading(true);
    try {
      const response = await ticketAPI.update(ticketData.id, ticketData);
      const updatedTicket = response.data || response;
      
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
      return { success: true, ticket: updatedTicket };
    } catch (err) {
      console.error('Error updating ticket:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update ticket.' };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId) => {
    if (!ticketId) {
      return { success: false, error: 'Invalid ticket ID for deletion.' };
    }

    setActionLoading(true);
    try {
      await ticketAPI.delete(ticketId);
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== ticketId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to delete ticket.' };
    } finally {
      setActionLoading(false);
    }
  }, []);

  const forwardTicket = useCallback(async (ticketId, forwardData) => {
    setActionLoading(true);
    try {
      const response = await ticketAPI.forwardTicket(ticketId, forwardData);

        // Try to fetch the updated ticket and optimistically add to forwarded-by-me list
        try {
          const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
          const currentUserId = currentUser?.id;
          const ticketRes = await ticketAPI.getById(ticketId);
          const updated = ticketRes.data || ticketRes || null;
          
          if (updated && currentUserId) {
            const forwardedFromId = updated.forwarded_from_id || updated.forwardedFromId || updated.forwardedFrom?.id;
            const isForwarded = updated.is_forwarded === true || updated.isForwarded === true || typeof updated.forward_chain_id !== 'undefined' || typeof updated.forwardChainId !== 'undefined';
            if (isForwarded && forwardedFromId && String(forwardedFromId) === String(currentUserId)) {
              setForwardedTickets(prev => {
                const exists = prev.some(t => t.id === updated.id);
                return exists ? prev : [updated, ...prev];
              });
            }
          }
        } catch (e) {
          console.error('Error in optimistic update:', e);
          // Non-fatal; we'll refresh lists below
        }

      // Refresh tickets after forwarding to ensure consistency across tabs
      await loadTickets();
      await loadForwardedTickets();
      return { success: true, data: response.data || response };
    } catch (err) {
      console.error('Error forwarding ticket:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to forward ticket.' };
    } finally {
      setActionLoading(false);
    }
  }, [loadTickets, loadForwardedTickets]);

  const loadTicketFiles = useCallback(async (ticketId) => {
    try {
      const response = await ticketAPI.getAttachments(ticketId);
      const files = response.data || response || [];
      setTicketFiles(prev => ({
        ...prev,
        [ticketId]: files
      }));
      return files;
    } catch (err) {
      console.error('Error loading ticket files:', err);
      setTicketFiles(prev => ({
        ...prev,
        [ticketId]: []
      }));
      return [];
    }
  }, []);

  const uploadTicketFile = useCallback(async (file, ticketId) => {
    try {
      const response = await ticketAPI.uploadAttachment(ticketId, file);
      const uploadedFile = response.data || response;
      setTicketFiles(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), uploadedFile]
      }));
      return uploadedFile;
    } catch (err) {
      console.error('File upload error:', err);
      // If it's a 500 error but the file was actually uploaded, don't throw an error
      if (err.response?.status === 500) {
        console.warn('Server returned 500 but file may have been uploaded successfully');
        // Try to refresh the file list to see if the file was actually uploaded
        try {
          const files = await ticketAPI.getAttachments(ticketId);
          if (files.data && files.data.length > 0) {
            setTicketFiles(prev => ({
              ...prev,
              [ticketId]: files.data
            }));
            return files.data[files.data.length - 1]; // Return the last uploaded file
          }
        } catch (refreshErr) {
          console.error('Error refreshing file list:', refreshErr);
        }
      }
      throw new Error('Failed to upload file.');
    }
  }, []);

  const deleteTicketFile = useCallback(async (ticketId, fileId) => {
    try {
      await ticketAPI.deleteAttachment(ticketId, fileId);
      setTicketFiles(prev => ({
        ...prev,
        [ticketId]: prev[ticketId]?.filter(f => f.id !== fileId) || []
      }));
    } catch (err) {
      throw new Error('Failed to delete file.');
    }
  }, []);

  const downloadTicketFile = useCallback(async (ticketId, fileId) => {
    try {
      const response = await fileAPI.download(fileId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get file name from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'download';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error('Failed to download file.');
    }
  }, []);

  const getTicketFiles = useCallback((ticketId) => {
    return ticketFiles[ticketId] || [];
  }, [ticketFiles]);

  const addComment = useCallback(async (ticketId, comment) => {
    try {
      const response = await commentAPI.addTicketComment(ticketId, comment);
      return { success: true, comment: response.data || response };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add comment.' };
    }
  }, []);

  const loadComments = useCallback(async (ticketId) => {
    try {
      const response = await commentAPI.fetchTicketComments(ticketId);
      return response.data || response || [];
    } catch (err) {
      console.error('useTickets: Error loading comments:', err);
      return [];
    }
  }, []);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      return { success: true };
    } catch (err) {
      console.error('Error deleting comment:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to delete comment.' };
    }
  }, []);

  const refreshTickets = useCallback(async () => {
    try {
      await Promise.all([
        loadTickets(),
        loadAssignedTickets(),
        loadForwardedTickets()
      ]);
    } catch (err) {
      console.error('Error refreshing tickets:', err);
    }
  }, [loadTickets, loadAssignedTickets, loadForwardedTickets]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    // State
    tickets,
    assignedTickets,
    forwardedTickets,
    loading,
    actionLoading,
    departments,
    users,
    error,
    
    // Actions
    loadTickets,
    loadAssignedTickets,
    loadForwardedTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    forwardTicket,
    loadTicketFiles,
    uploadTicketFile,
    deleteTicketFile,
    downloadTicketFile,
    getTicketFiles,
    addComment,
    loadComments,
    deleteComment,
    refreshTickets,
    
    // Setters
    setError,
  };
};
