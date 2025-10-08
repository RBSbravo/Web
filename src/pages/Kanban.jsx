import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  useTheme,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoveToInbox as MoveIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { taskAPI, ticketAPI } from '../services/api';
import { format } from 'date-fns';
import useUser from '../context/useUser';
import PageHeader from '../components/layout/PageHeader';

const columns = [
  { id: 'open', title: 'Open / To Do', color: 'primary.light' },
  { id: 'in_progress', title: 'In Progress', color: 'warning.light' },
  { id: 'done', title: 'Done / Completed', color: 'success.light' },
];

const Kanban = () => {
  const theme = useTheme();
  
  const priorityColors = {
    low: theme.palette.success.main,
    medium: theme.palette.warning.main,
    high: theme.palette.error.main,
    urgent: theme.palette.secondary.main,
  };
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('task');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch tasks and tickets from backend
  useEffect(() => {
    if (!user || !user.departmentId) return;
    setLoading(true);
    Promise.all([
      taskAPI.getAll({ departmentId: user.departmentId }),
      ticketAPI.getAssignedTickets(),
      ticketAPI.getAll({ created_by: user.id, limit: 1000 })
    ]).then(([taskRes, assignedRes, myRes]) => {
      setTasks(taskRes.data);
      const assigned = assignedRes.data || [];
      const mine = (myRes.data && (myRes.data.tickets || myRes.data)) || [];
      const mergedById = new Map();
      [...assigned, ...mine].forEach(t => {
        if (t && t.id) mergedById.set(t.id, t);
      });
      const normalized = Array.from(mergedById.values()).map(t => ({
        ...t,
        assignedUser: t.assignedUser || t.assignee || t.ticketAssignee || null,
        assignee: t.assignee || t.ticketAssignee || t.assignedUser || null,
      }));
      setTickets(normalized);
      setLoading(false);
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
      setLoading(false);
    });
  }, [user]);

  // Combine tasks and tickets for the kanban board
  const allItems = useMemo(() => {
    const taskItems = tasks.map(task => ({ ...task, type: 'task' }));
    const ticketItems = tickets.map(ticket => ({ ...ticket, type: 'ticket' }));
    return [...taskItems, ...ticketItems];
  }, [tasks, tickets]);

  // Group items by status for columns
  const getColumnItems = (columnId) => {
    return allItems.filter(item => {
      const status = item.status;
      switch (columnId) {
        case 'open':
          // Map pending, open statuses to Open/To Do
          return status === 'pending' || status === 'open';
        case 'in_progress':
          // Map in_progress status to In Progress
          return status === 'in_progress';
        case 'done':
          // Map completed, resolved, closed statuses to Done/Completed
          return status === 'completed' || status === 'resolved' || status === 'closed';
        default:
          return false;
      }
    });
  };

  // Map column ID to actual status value
  const getStatusFromColumn = (columnId, itemType) => {
    switch (columnId) {
      case 'open':
        return itemType === 'task' ? 'pending' : 'open';
      case 'in_progress':
        return 'in_progress';
      case 'done':
        return itemType === 'task' ? 'completed' : 'resolved';
      default:
        return columnId;
    }
  };

  // Drag and drop handler
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return; // Only handle status change
    const item = allItems.find(i => i.id === draggableId);
    if (!item) return;
    
    const newStatus = getStatusFromColumn(destination.droppableId, item.type);
    
    try {
      if (item.type === 'task') {
        await taskAPI.updateStatus(item.id, newStatus);
        setTasks(prev => prev.map(task =>
          task.id === item.id ? { ...task, status: newStatus } : task
        ));
      } else {
        await ticketAPI.updateStatus(item.id, newStatus);
        setTickets(prev => prev.map(ticket =>
          ticket.id === item.id ? { ...ticket, status: newStatus } : ticket
        ));
      }
      setSnackbar({ open: true, message: `Moved to ${destination.droppableId}`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleMenuOpen = (event, item) => {
    setMenuAnchor(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedItem(null);
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    setDialogType(selectedItem.type);
    setSelectedColumn(selectedItem.status);
    setNewItem({
      title: selectedItem.title || '',
      description: selectedItem.description || '',
      priority: selectedItem.priority || 'medium',
      assignedTo: selectedItem.assignedToId || selectedItem.assignedTo || '',
      dueDate: selectedItem.dueDate ? selectedItem.dueDate.split('T')[0] : '',
    });
    setIsEditMode(true);
    setOpenDialog(true);
    setMenuAnchor(null);
  };

  const handleDeleteItem = useCallback(async (itemId) => {
    const item = allItems.find(item => item.id === itemId);
    try {
      if (item.type === 'task') {
        await taskAPI.delete(item.id);
        setTasks(prev => prev.filter(task => task.id !== itemId));
      } else {
        await ticketAPI.delete(item.id);
        setTickets(prev => prev.filter(ticket => ticket.id !== itemId));
      }
      setSnackbar({
        open: true,
        message: `${item.type} deleted successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to delete ${item.type}`,
        severity: 'error'
      });
    }
    setMenuAnchor(null);
  }, [allItems]);

  const handleAddOrEditItem = async () => {
    if (!newItem.title || !newItem.description) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }
    try {
      if (isEditMode && selectedItem) {
        // Edit mode
        if (selectedItem.type === 'task') {
          const { data } = await taskAPI.update(selectedItem.id, {
            title: newItem.title,
            description: newItem.description,
            priority: newItem.priority,
            dueDate: newItem.dueDate,
          });
          setTasks(prev => prev.map(task =>
            task.id === selectedItem.id ? { ...task, ...data } : task
          ));
        } else {
          const { data } = await ticketAPI.update(selectedItem.id, {
            title: newItem.title,
            description: newItem.description,
            priority: newItem.priority,
            dueDate: newItem.dueDate,
          });
          setTickets(prev => prev.map(ticket =>
            ticket.id === selectedItem.id ? { ...ticket, ...data } : ticket
          ));
        }
        setSnackbar({
          open: true,
          message: `${selectedItem.type} updated successfully`,
          severity: 'success'
        });
      } else {
        // Add mode
        const actualStatus = getStatusFromColumn(selectedColumn, dialogType);
        const newItemData = {
          id: `${dialogType}-${Date.now()}`,
          ...newItem,
          status: actualStatus,
          type: dialogType,
          assignedTo: { id: 'user-1', name: 'John Doe', avatar: 'JD' },
          comments: 0,
          attachments: 0,
          createdAt: new Date().toISOString(),
        };
        if (dialogType === 'task') {
          setTasks(prev => [...prev, newItemData]);
        } else {
          setTickets(prev => [...prev, { ...newItemData, category: 'feature' }]);
        }
        setSnackbar({
          open: true,
          message: `${dialogType} created successfully`,
          severity: 'success'
        });
      }
      setNewItem({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
      setOpenDialog(false);
      setIsEditMode(false);
      setSelectedItem(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to save changes',
        severity: 'error'
      });
    }
  };

  // Render item (same as before, but use Draggable)
  const renderItem = (item, index) => {
    const isMine =
      (item.assignedTo === user.id) ||
      (item.assignedToId === user.id) ||
      (item.assignedUser && item.assignedUser.id === user.id) ||
      (item.assignee && item.assignee.id === user.id);
    
    // Determine if item is internal (same department) or external
    const isSentByMe = item.type === 'ticket' && (
      item.created_by === user.id ||
      item.original_creator_id === user.id ||
      (item.ticketCreator && item.ticketCreator.id === user.id)
    );
    const isInternal = isSentByMe || item.departmentId === user.departmentId || item.department === user.department;
    const departmentColor = isInternal ? theme.palette.success.light : theme.palette.warning.light; // Green for internal, Orange for external
    const borderColor = isInternal ? theme.palette.success.main : theme.palette.warning.main;
    
    return (
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              mb: 1.5,
              cursor: 'pointer',
              boxShadow: snapshot.isDragging ? theme.shadows[8] : theme.shadows[1],
              border: isMine ? `2px solid ${theme.palette.primary.main}` : `1px solid ${borderColor}`,
              backgroundColor: isMine ? theme.palette.action.selected : departmentColor,
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
            }}
            onClick={() => {
              setSelectedItemDetails(item);
              setOpenDetailsDialog(true);
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={item.type}
                    size="small"
                    color={item.type === 'task' ? 'primary' : 'secondary'}
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                  <Chip
                    label={isInternal ? 'Internal' : 'External'}
                    size="small"
                    sx={{ 
                      fontSize: '0.65rem', 
                      height: 20,
                      backgroundColor: borderColor,
                      color: 'white'
                    }}
                  />
                </Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, item); }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.7rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Chip
                  label={item.priority}
                  size="small"
                  sx={{
                    backgroundColor: priorityColors[item.priority],
                    color: 'white',
                    fontSize: '0.65rem',
                    height: 18,
                  }}
                />
                {item.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <ScheduleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {format(new Date(item.dueDate), 'MMM dd')}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem' }}>
                    {item.assignedUser?.firstname?.[0] || item.assignee?.firstname?.[0] || '?'}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {item.assignedUser?.firstname || item.assignee?.firstname || 'Unassigned'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {item.comments > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <CommentIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {item.comments}
                      </Typography>
                    </Box>
                  )}
                  {item.attachments > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <AttachFileIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {item.attachments}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  };

  // Render
  return (
    <Box sx={{ p: 3, minHeight: '100vh', height: 'auto', display: 'flex', flexDirection: 'column' }}>
      <PageHeader 
        title="Kanban Board"
        subtitle="Drag and drop tasks and tickets across stages"
        emoji="🗂️"
        color="secondary"
      />
      
      {/* Color Coding Legend */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Color Coding:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.success.light, border: `1px solid ${theme.palette.success.main}`, borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Internal (Same Department)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.warning.light, border: `1px solid ${theme.palette.warning.main}`, borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary">
            External (Other Department)
          </Typography>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
            {columns.map((column) => {
              const columnItems = getColumnItems(column.id);
              return (
                <Grid item xs={12} md={4} key={column.id}>
                  <Paper
                    sx={{
                      height: '100%',
                      backgroundColor: column.color,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {column.title}
                      </Typography>
                      <Badge badgeContent={columnItems.length} color="primary">
                        <Box sx={{ width: 20, height: 20 }} />
                      </Badge>
                    </Box>
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            flex: 1,
                            minHeight: 200,
                            backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.1)' : 'transparent',
                            borderRadius: 1,
                            p: 1,
                          }}
                        >
                          {columnItems.map((item, index) => renderItem(item, index))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DragDropContext>
      )}
      {/* Item Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem onClick={handleEditItem}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <Divider />
        <MenuItem 
          onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setIsEditMode(false); setSelectedItem(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? `Edit ${dialogType === 'task' ? 'Task' : 'Ticket'}` : `Add New ${dialogType === 'task' ? 'Task' : 'Ticket'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              value={newItem.dueDate}
              onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setIsEditMode(false); setSelectedItem(null); }}>Cancel</Button>
          <Button onClick={handleAddOrEditItem} variant="contained">
            {isEditMode ? 'Save Changes' : `Add ${dialogType === 'task' ? 'Task' : 'Ticket'}`}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Details</DialogTitle>
        <DialogContent dividers>
          {selectedItemDetails ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{selectedItemDetails.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedItemDetails.description}</Typography>
              <Divider />
              <Typography variant="body2"><b>Type:</b> {selectedItemDetails.type}</Typography>
              <Typography variant="body2"><b>Status:</b> {selectedItemDetails.status}</Typography>
              <Typography variant="body2"><b>Priority:</b> {selectedItemDetails.priority}</Typography>
              {selectedItemDetails.dueDate && (
                <Typography variant="body2"><b>Due Date:</b> {format(new Date(selectedItemDetails.dueDate), 'PPP')}</Typography>
              )}
              {selectedItemDetails.category && (
                <Typography variant="body2"><b>Category:</b> {selectedItemDetails.category}</Typography>
              )}
              {(selectedItemDetails.desired_action || selectedItemDetails.desiredAction) && (
                <Typography variant="body2"><b>Desired Action:</b> {selectedItemDetails.desired_action || selectedItemDetails.desiredAction}</Typography>
              )}
              <Typography variant="body2"><b>Assigned To:</b> {selectedItemDetails.assignedUser?.firstname || selectedItemDetails.assignee?.firstname || 'Unassigned'}</Typography>
              <Typography variant="body2"><b>Department:</b> {selectedItemDetails.department?.name || ''}</Typography>
              {selectedItemDetails.comments !== undefined && (
                <Typography variant="body2"><b>Comments:</b> {selectedItemDetails.comments}</Typography>
              )}
              {selectedItemDetails.attachments !== undefined && (
                <Typography variant="body2"><b>Attachments:</b> {selectedItemDetails.attachments}</Typography>
              )}
              <Typography variant="body2"><b>Created At:</b> {selectedItemDetails.createdAt ? format(new Date(selectedItemDetails.createdAt), 'PPP p') : ''}</Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Kanban; 