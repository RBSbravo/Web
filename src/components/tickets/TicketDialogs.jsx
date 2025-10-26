import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  useTheme,
  ListSubheader,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ConfirmationNumber as TicketIcon,
  PriorityHigh as PriorityHighIcon,
  Remove as PriorityMediumIcon,
  LowPriority as PriorityLowIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import FileUploadSection from '../FileUploadSection';
import CommentSection from '../CommentSection';
import ForwardTicketButton from './ForwardTicketButton';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/ticketUtils';

// Error Dialog Component
export const ErrorDialog = ({ open, message, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 700 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
      Error
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ color: 'text.primary', fontSize: '1.1rem', mb: 1 }}>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" color="error" sx={{ minWidth: 100, borderRadius: 2 }}>
        OK
      </Button>
    </DialogActions>
  </Dialog>
);

// Success Dialog Component
export const SuccessDialog = ({ open, message, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', fontWeight: 700 }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }} />
      Success
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ color: 'text.primary', fontSize: '1.1rem', mb: 1 }}>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" color="success" sx={{ minWidth: 100, borderRadius: 2 }}>
        OK
      </Button>
    </DialogActions>
  </Dialog>
);

// Delete Confirmation Dialog Component
export const DeleteDialog = ({ open, ticket, onClose, onConfirm, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      color: 'error.main', 
      fontWeight: 700 
    }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
      Confirm Deletion
    </DialogTitle>
    <DialogContent>
      <Typography variant="body1" sx={{ color: 'text.primary', fontSize: '1.1rem', mb: 2 }}>
        Are you sure you want to delete this ticket? This action cannot be undone.
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'action.hover', p: 2, borderRadius: 1, fontSize: '1.1rem' }}>
        {ticket?.title}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Button onClick={onClose} sx={{ minWidth: 100 }}>
        Cancel
      </Button>
      <Button 
        onClick={onConfirm} 
        color="error" 
        variant="contained"
        disabled={loading}
        sx={{ minWidth: 100 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
);

// New Ticket Dialog Component
export const NewTicketDialog = ({ 
  open, 
  onClose, 
  newTicket, 
  onTicketChange, 
  newTicketFiles,
  onFileUpload,
  onFileDelete,
  departments,
  users,
  onSubmit,
  loading,
  isMobile,
  currentUserId
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
    <DialogTitle sx={{ 
      fontSize: { xs: '1.25rem', sm: '1.5rem' },
      pb: { xs: 1, sm: 2 }
    }}>
      Create New Ticket
    </DialogTitle>
    <DialogContent sx={{ 
      pt: { xs: 1, sm: 2 },
    }}>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} sx={{ mt: 1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ticket Title"
              name="title"
              value={newTicket.title}
              onChange={onTicketChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newTicket.description}
              onChange={onTicketChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Desired Action</InputLabel>
              <Select
                name="desired_action"
                value={newTicket.desired_action || ''}
                label="Desired Action"
                onChange={onTicketChange}
              >
                <MenuItem value="Approval/Signature">Approval/Signature</MenuItem>
                <MenuItem value="Comments/Recommendation">Comments/Recommendation</MenuItem>
                <MenuItem value="Re-Write/Re-Draft">Re-Write/Re-Draft</MenuItem>
                <MenuItem value="Information/Notation">Information/Notation</MenuItem>
                <MenuItem value="Dispatch">Dispatch</MenuItem>
                <MenuItem value="File">File</MenuItem>
                <MenuItem value="Mis routed">Mis routed</MenuItem>
                <MenuItem value="return to office of origin">Return to office of origin</MenuItem>
                <MenuItem value="photocopy file">Photocopy file</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
                <MenuItem value="Staff action">Staff action</MenuItem>
                <MenuItem value="See me/ Call me">See me/ Call me</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={newTicket.priority}
                label="Priority"
                onChange={onTicketChange}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={newTicket.status || 'pending'}
                label="Status"
                onChange={onTicketChange}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Send To</InputLabel>
              <Select
                name="sendTo"
                value={newTicket.sendTo || ''}
                label="Send To"
                onChange={onTicketChange}
              >
                <ListSubheader>Admins</ListSubheader>
                {users
                  .filter(user => user.role === 'admin')
                  .filter(user => user.id !== currentUserId)
                  .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstname} {user.lastname} (Admin)
                  </MenuItem>
                ))}
                <ListSubheader>Department Heads</ListSubheader>
                {departments
                  .filter(dept => dept.head)
                  .filter(dept => dept.head.id !== currentUserId)
                  .map((dept) => (
                  <MenuItem key={dept.head.id} value={dept.head.id}>
                    {dept.head.firstname} {dept.head.lastname} (Dept Head, {dept.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Due Date"
              name="due_date"
              type="date"
              value={newTicket.due_date || ''}
              onChange={onTicketChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Attachments
              </Typography>

              {newTicketFiles.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No attachments yet.
                </Typography>
              )}

              {newTicketFiles.length > 0 && (
                <List dense sx={{ 
                  maxHeight: 200, 
                  overflowY: 'auto', 
                  mb: 2,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}>
                  {newTicketFiles.map((file) => {
                    const fileName = file.file_name || file.name || 'Unknown File';
                    
                    return (
                      <React.Fragment key={file.id}>
                        <ListItem
                          secondaryAction={
                            <Tooltip title="Delete file" arrow>
                              <IconButton 
                                edge="end" 
                                onClick={() => onFileDelete(file.id)}
                                color="error"
                                size="small"
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'error.light',
                                    color: 'error.contrastText'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemIcon>
                            <FileIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Tooltip title="Click to download file" arrow>
                                <Typography
                                  component="span"
                                  sx={{ 
                                    cursor: 'pointer', 
                                    color: 'primary.main', 
                                    textDecoration: 'underline',
                                    '&:hover': { textDecoration: 'none' }
                                  }}
                                  onClick={() => {
                                    // Handle download for temp files
                                    if (file.file) {
                                      const url = URL.createObjectURL(file.file);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = file.name;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      URL.revokeObjectURL(url);
                                    }
                                  }}
                                >
                                  {fileName}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Typography variant="caption" color="text.disabled">
                                {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : '—'} • {formatFileSize(file.file_size || file.size || 0)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              )}

              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                disabled={loading || newTicketFiles.length >= 5}
                sx={{ mt: 1 }}
              >
                {loading ? 'Uploading...' : 'Upload File (PDF & Images Only)'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      onFileUpload(file);
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,application/pdf,image/*"
                  disabled={loading || newTicketFiles.length >= 5}
                />
              </Button>
              
              {/* File type info */}
              <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                Allowed file types: PDF, JPG, PNG, GIF, WebP, BMP (Max 10MB each)
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Button onClick={onClose}>
        Cancel
      </Button>
      <Button 
        variant="contained"
        onClick={onSubmit}
        disabled={loading}
        sx={{ minWidth: 100 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Create Ticket'}
      </Button>
    </DialogActions>
  </Dialog>
);

// View Ticket Dialog Component
export const ViewTicketDialog = ({ 
  open, 
  onClose, 
  ticket, 
  departments,
  users = [],
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  getPriorityIcon,
  onRefresh,
  getTicketFiles,
  onFileDelete,
  onEdit,
  isMobile,
  addComment,
  loadComments,
  deleteComment
}) => {
  useTheme();

  // Helper function to get user name by ID or user object
  const getUserName = (userIdOrUser) => {
    if (!userIdOrUser) return 'Unknown';
    
    // If it's already a user object (from association), use it directly
    if (typeof userIdOrUser === 'object' && userIdOrUser.firstname) {
      return `${userIdOrUser.firstname} ${userIdOrUser.lastname}`.trim() || userIdOrUser.email || userIdOrUser.username || 'Unknown';
    }
    
    // If it's a user ID, find the user in the users array
    const user = users.find(u => u.id === userIdOrUser);
    return user ? `${user.firstname} ${user.lastname}`.trim() || user.email || user.username || userIdOrUser : userIdOrUser;
  };

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'N/A';
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ 
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        pb: { xs: 1, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar 
          sx={{ 
            bgcolor: `${getStatusColor(ticket.status)}.light`,
            color: `${getStatusColor(ticket.status)}.main`,
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 }
          }}
        >
          {(() => {
            const iconName = getStatusIcon(ticket.status);
            switch (iconName) {
              case 'Schedule': return <ScheduleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />;
              case 'CheckCircle': return <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />;
              case 'Error': return <ErrorIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />;
              default: return <TicketIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />;
            }
          })()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {ticket.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ticket #{ticket.id}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Description
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1">{ticket.description}</Typography>
            </Box>
          </Grid>

          {(ticket.desired_action || ticket.desiredAction) && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Desired Action
              </Typography>
              <Typography variant="body1">{ticket.desired_action || ticket.desiredAction}</Typography>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
              <Chip
                label={ticket.priority}
                color={getPriorityColor(ticket.priority)}
                icon={(() => {
                  const iconName = getPriorityIcon(ticket.priority);
                  switch (iconName) {
                    case 'PriorityHigh': return <PriorityHighIcon sx={{ fontSize: 16 }} />;
                    case 'Remove': return <PriorityMediumIcon sx={{ fontSize: 16 }} />;
                    case 'LowPriority': return <PriorityLowIcon sx={{ fontSize: 16 }} />;
                    default: return <PriorityMediumIcon sx={{ fontSize: 16 }} />;
                  }
                })()}
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={ticket.status.replace('_', ' ')}
                color={getStatusColor(ticket.status)}
                icon={(() => {
                  const iconName = getStatusIcon(ticket.status);
                  switch (iconName) {
                    case 'Schedule': return <ScheduleIcon sx={{ fontSize: 16 }} />;
                    case 'CheckCircle': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
                    case 'Error': return <ErrorIcon sx={{ fontSize: 16 }} />;
                    default: return <TicketIcon sx={{ fontSize: 16 }} />;
                  }
                })()}
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Created By
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 20 }} color="action" />
              {getUserName(ticket.ticketCreator || ticket.createdBy || ticket.created_by)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Department
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 20 }} color="action" />
              {getDepartmentName(ticket.departmentId || ticket.department_id)}
            </Typography>
          </Grid>
          
          {(ticket.ticketAssignee || ticket.assignedTo || ticket.assigned_to) && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Assigned To
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 20 }} color="action" />
                {getUserName(ticket.ticketAssignee || ticket.assignedTo || ticket.assigned_to)}
              </Typography>
            </Grid>
          )}
          
          {ticket.due_date && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Due Date
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 20 }} color="action" />
                {formatDate(ticket.due_date)}
              </Typography>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Created
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ fontSize: 20 }} color="action" />
              {formatDateTime(ticket.created_at || ticket.createdAt)}
            </Typography>
          </Grid>
        </Grid>

        {getTicketFiles(ticket.id).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <FileUploadSection
              entityId={ticket.id}
              fetchFiles={async () => ({ data: getTicketFiles(ticket.id) })}
              uploadFile={() => {}} // No upload in view mode
              deleteFile={onFileDelete}
              maxFiles={5}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={['*/*']}
              disabled={false}
              readOnly={true}
            />
          </Box>
        )}

        {/* Comments Section */}
        <CommentSection 
          entityId={ticket?.id} 
          user={JSON.parse(localStorage.getItem('user') || '{}')}
          users={users}
          fetchComments={loadComments}
          addComment={addComment}
          deleteComment={deleteComment}
        />
      </DialogContent>
      <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <ForwardTicketButton 
          ticket={ticket}
          disabled={!(
            ticket?.assigned_to === JSON.parse(localStorage.getItem('user') || '{}')?.id || 
            ticket?.forwarded_to_id === JSON.parse(localStorage.getItem('user') || '{}')?.id || 
            ticket?.current_handler_id === JSON.parse(localStorage.getItem('user') || '{}')?.id
          )}
          onForward={() => {
            onClose();
            if (typeof onRefresh === 'function') {
              onRefresh();
            }
          }}
        />
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => {
            onClose();
            onEdit(ticket);
          }}
          sx={{ minWidth: 100 }}
        >
          Edit Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Edit Ticket Dialog Component
export const EditTicketDialog = ({ 
  open, 
  onClose, 
  ticket, 
  onTicketChange, 
  editingTicketFiles,
  onFileUpload,
  onFileDelete,
  departments,
  onSubmit,
  loading,
  fileOperationsCount = 0
}) => {
  // Don't render if ticket is null
  if (!ticket) {
    return null;
  }
  
  return (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <EditIcon color="primary" />
        <Typography variant="h6">Edit Ticket</Typography>
      </Box>
    </DialogTitle>
    <DialogContent dividers>
      {ticket && (
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={ticket.title || ''}
                onChange={onTicketChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={ticket.description || ''}
                onChange={onTicketChange}
                multiline
                rows={4}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Desired Action</InputLabel>
                <Select
                  name="desired_action"
                  value={ticket.desired_action || ''}
                  label="Desired Action"
                  onChange={onTicketChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Approval/Signature">Approval/Signature</MenuItem>
                  <MenuItem value="Comments/Recommendation">Comments/Recommendation</MenuItem>
                  <MenuItem value="Re-Write/Re-Draft">Re-Write/Re-Draft</MenuItem>
                  <MenuItem value="Information/Notation">Information/Notation</MenuItem>
                  <MenuItem value="Dispatch">Dispatch</MenuItem>
                  <MenuItem value="File">File</MenuItem>
                  <MenuItem value="Mis routed">Mis routed</MenuItem>
                  <MenuItem value="return to office of origin">Return to office of origin</MenuItem>
                  <MenuItem value="photocopy file">Photocopy file</MenuItem>
                  <MenuItem value="Study">Study</MenuItem>
                  <MenuItem value="Staff action">Staff action</MenuItem>
                  <MenuItem value="See me/ Call me">See me/ Call me</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={fileOperationsCount !== 0 ? "Remarks (Required - File operations performed)" : "Remarks (Required for updates)"}
                name="remarks"
                value={ticket?.remarks || ''}
                onChange={onTicketChange}
                multiline
                rows={3}
                required
                error={fileOperationsCount !== 0 && !ticket?.remarks?.trim()}
                helperText={fileOperationsCount !== 0 ? "Remarks are required when file operations are performed" : "Please provide remarks explaining the changes made to this ticket"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={ticket.priority || 'Medium'}
                  label="Priority"
                  onChange={onTicketChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={ticket.status || 'pending'}
                  label="Status"
                  onChange={onTicketChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Send To</InputLabel>
                <Select
                  name="sendTo"
                  value={ticket.sendTo || ''}
                  label="Send To"
                  onChange={onTicketChange}
                  sx={{ borderRadius: 2 }}
                >
                  <ListSubheader>Department Heads</ListSubheader>
                  {departments.filter(dept => dept.head).map((dept) => (
                    <MenuItem key={dept.head.id} value={dept.head.id}>
                      {dept.head.firstname} {dept.head.lastname} (Dept Head, {dept.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="due_date"
                type="date"
                value={ticket.due_date || ''}
                onChange={onTicketChange}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Attachments
                </Typography>

                {editingTicketFiles.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No attachments yet.
                  </Typography>
                )}

                {editingTicketFiles.length > 0 && (
                  <List dense sx={{ 
                    maxHeight: 200, 
                    overflowY: 'auto', 
                    mb: 2,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': { display: 'none' }
                  }}>
                    {editingTicketFiles.map((file) => {
                      const fileName = file.file_name || file.name || 'Unknown File';
                      
                      return (
                        <React.Fragment key={file.id}>
                          <ListItem
                            secondaryAction={
                              <Tooltip title="Delete file" arrow>
                                <IconButton 
                                  edge="end" 
                                  onClick={() => onFileDelete(file.id)}
                                  color="error"
                                  size="small"
                                  sx={{ 
                                    '&:hover': { 
                                      backgroundColor: 'error.light',
                                      color: 'error.contrastText'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemIcon>
                              <FileIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Tooltip title="Click to download file" arrow>
                                  <Typography
                                    component="span"
                                    sx={{ 
                                      cursor: 'pointer', 
                                      color: 'primary.main', 
                                      textDecoration: 'underline',
                                      '&:hover': { textDecoration: 'none' }
                                    }}
                                    onClick={() => {
                                      // Handle download for both temp files and server files
                                      if (file.file) {
                                        // Temp file
                                        const url = URL.createObjectURL(file.file);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = file.name;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                      } else {
                                        // Server file - download from server
                                        const token = localStorage.getItem('token');
                                        const url = `/api/files/${file.id}/download`;
                                        fetch(url, {
                                          headers: { Authorization: `Bearer ${token}` }
                                        }).then(response => {
                                          if (response.ok) {
                                            return response.blob();
                                          }
                                          throw new Error('Download failed');
                                        }).then(blob => {
                                          const downloadUrl = URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = downloadUrl;
                                          link.download = file.name;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          URL.revokeObjectURL(downloadUrl);
                                        }).catch(err => {
                                          console.error('Download error:', err);
                                        });
                                      }
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                </Tooltip>
                              }
                              secondary={
                                <Typography variant="caption" color="text.disabled">
                                  {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : '—'} • {formatFileSize(file.file_size || file.size || 0)}
                                </Typography>
                              }
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  disabled={loading || editingTicketFiles.length >= 5}
                  sx={{ mt: 1 }}
                >
                  {loading ? 'Uploading...' : 'Upload File (PDF & Images Only)'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        onFileUpload(file);
                      }
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,application/pdf,image/*"
                    disabled={loading || editingTicketFiles.length >= 5}
                  />
                </Button>
                
                {/* File type info */}
                <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                  Allowed file types: PDF, JPG, PNG, GIF, WebP, BMP (Max 10MB each)
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Button onClick={onClose} disabled={fileOperationsCount !== 0}>
        Cancel
      </Button>
      <Button 
        variant="contained"
        onClick={onSubmit}
        disabled={loading || (fileOperationsCount !== 0 && !ticket?.remarks?.trim())}
        sx={{ minWidth: 100 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Update Ticket'}
      </Button>
    </DialogActions>
  </Dialog>
  );
};
