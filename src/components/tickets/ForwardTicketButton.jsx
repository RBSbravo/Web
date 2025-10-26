import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Forward as ForwardIcon } from '@mui/icons-material';
import { userAPI, ticketAPI } from '../../services/api';

const ForwardTicketButton = ({ ticket, onForward, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadRecipients();
    }
  }, [open]);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      setError('');
      
      let allUsers = [];
      
      // Try to fetch users with role parameter first
      try {
        const deptHeadRes = await userAPI.getAll({ role: 'department_head' });
        const adminRes = await userAPI.getAll({ role: 'admin' });
        const deptHeads = deptHeadRes.data || deptHeadRes || [];
        const admins = adminRes.data || adminRes || [];
        allUsers = [...deptHeads, ...admins];
      } catch (roleError) {
        // Fallback: fetch all users and filter
        const allUsersRes = await userAPI.getAll();
        allUsers = allUsersRes.data || allUsersRes || [];
      }
      
      // If we fetched all users, filter for department heads and admins
      let eligibleUsers = allUsers;
      if (allUsers.length > 0 && !allUsers.some(user => user.role === 'department_head' || user.role === 'admin')) {
        eligibleUsers = allUsers.filter(user => {
          const role = user.role?.toLowerCase();
          return role === 'admin' ||
                 role === 'department_head' || 
                 role === 'departmenthead' || 
                 role === 'dept_head' ||
                 role === 'head' ||
                 (user.role && user.role.includes('head'));
        });
      }
      
      // Format the recipients - department heads and admins
      const allRecipients = eligibleUsers.map(user => {
        const roleLabel = user.role === 'admin' ? 'Admin' : 'Dept Head';
        return {
          ...user,
          displayName: `${user.firstname || user.firstName || 'Unknown'} ${user.lastname || user.lastName || 'User'} (${roleLabel})`
        };
      });
      
      // If no eligible users found, show a message
      if (allRecipients.length === 0) {
        setError('No department heads or admins found in the system. Please ensure there are users with appropriate roles.');
      } else {
        setRecipients(allRecipients);
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error loading recipients:', error);
      setError('Failed to load recipients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async () => {
    if (!selectedRecipient || !reason.trim()) {
      setError('Please select a recipient and provide a reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ticketAPI.forwardTicket(ticket.id, {
        toUserId: selectedRecipient,
        reason: reason.trim()
      });
      
      onForward && onForward();
      setOpen(false);
      setSelectedRecipient('');
      setReason('');
    } catch (error) {
      console.error('Error forwarding ticket:', error);
      setError(error.response?.data?.error || 'Failed to forward ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRecipient('');
    setReason('');
    setError('');
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ForwardIcon />}
        onClick={() => setOpen(true)}
        disabled={disabled}
        sx={{ mr: 1 }}
      >
        Forward
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Forward Ticket #{ticket?.id}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Forwarding ticket to a department head or admin
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Forward To</InputLabel>
            <Select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              label="Forward To"
              disabled={loading || recipients.length === 0}
            >
              {loading ? (
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    Loading recipients...
                  </Box>
                </MenuItem>
              ) : recipients.length === 0 ? (
                <MenuItem disabled>
                  No recipients available
                </MenuItem>
              ) : (
                recipients.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.displayName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Reason for Forwarding"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleForward} 
            variant="contained"
            disabled={!selectedRecipient || !reason.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Forward Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ForwardTicketButton; 