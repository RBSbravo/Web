/**
 * Task Form Component
 * Reusable form for creating and editing tasks
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
  getInitialTaskFormData, 
  validateTaskForm, 
  TASK_STATUS_OPTIONS, 
  TASK_PRIORITY_OPTIONS 
} from '../../utils/taskUtils';

const TaskForm = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  departmentUsers = [],
  pendingTickets = [],
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState(getInitialTaskFormData());
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // Initialize form data when dialog opens or initial data changes
  useEffect(() => {
    if (!open) return;

    console.log('TaskForm opened with pendingTickets:', pendingTickets);

    if (initialData && mode === 'edit') {
      setFormData({
        ...getInitialTaskFormData(),
        ...initialData,
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending',
        dueDate: initialData.dueDate || '',
        assignedToId: initialData.assignedToId || '',
        relatedTicketId: initialData.relatedTicketId || '',
        attachments: initialData.attachments || []
      });
    } else {
      setFormData(getInitialTaskFormData());
    }

    setErrors({});
    setFormError('');
  }, [open, initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Define allowed file types for tasks (PDF and images only)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp'
    ];
    
    // Validate each file
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only PDF and image files are allowed`);
      } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push(`${file.name}: File size must be less than 10MB`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      setFormError(errors.join(', '));
      return;
    }
    
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...validFiles] }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError('');

    const validation = validateTaskForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setFormError(error.message || 'An error occurred while saving the task');
    }
  };

  const handleClose = () => {
    setFormData(getInitialTaskFormData());
    setErrors({});
    setFormError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, pb: { xs: 1, sm: 2 } }}>
        {mode === 'create' ? 'Create New Task' : 'Edit Task'}
      </DialogTitle>
      
      <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Priority */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange}
                >
                  {TASK_PRIORITY_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status (only show in edit mode) */}
            {mode === 'edit' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks (Required for updates)"
                    name="remarks"
                    value={formData.remarks || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    required
                    helperText="Please provide remarks explaining the changes made to this task"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      label="Status"
                      onChange={handleChange}
                    >
                      {TASK_STATUS_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Assignee */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignedToId"
                  value={formData.assignedToId}
                  label="Assignee"
                  onChange={handleChange}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {departmentUsers
                    .filter(u => u.role === 'employee')
                    .map((user) => {
                      const name =
                        (user.firstname && user.lastname && `${user.firstname} ${user.lastname}`) ||
                        (user.firstName && user.lastName && `${user.firstName} ${user.lastName}`) ||
                        user.username ||
                        user.email ||
                        user.id;
                      return (
                        <MenuItem key={user.id} value={user.id}>
                          {name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
            </Grid>

            {/* Due Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Related Ticket */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Related Pending Ticket</InputLabel>
                <Select
                  name="relatedTicketId"
                  value={formData.relatedTicketId || ''}
                  label="Related Pending Ticket"
                  onChange={handleChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {pendingTickets.map(ticket => (
                    <MenuItem key={ticket.id} value={ticket.id}>
                      {ticket.title} (#{ticket.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* File Attachments (for both create and edit modes) */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {mode === 'create' ? 'Attach Files (PDF & Images Only)' : 'Upload Additional Files (PDF & Images Only)'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,application/pdf,image/*"
                  onChange={handleFileChange}
                />
              </Button>
              
              {/* File type info */}
              <Box sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                Allowed file types: PDF, JPG, PNG, GIF, WebP, BMP (Max 10MB each)
              </Box>
              
              {/* Show selected files */}
              {formData.attachments && formData.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    {mode === 'create' ? 'Files to upload:' : 'Additional files to upload:'}
                  </Box>
                  {formData.attachments.map((file, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', flex: 1 }}>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeAttachment(idx)}
                        startIcon={<DeleteIcon />}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Error Display */}
            {formError && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formError}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            mode === 'create' ? 'Create Task' : 'Save Changes'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 