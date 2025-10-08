import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Tabs,
  Tab,
  useTheme,
  Fade,
  Slide,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Assignment as TaskIcon,
  Comment as CommentIcon,
  Update as UpdateIcon,
  MarkEmailUnread as UnreadIcon,
  Done as ReadIcon,
  ConfirmationNumber as TicketIcon,
  CheckCircle as CompletedIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { notificationAPI } from '../../services';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'task_assigned':
    case 'task_updated':
    case 'task_completed':
      return <TaskIcon color="primary" />;
    case 'comment_added':
      return <CommentIcon color="secondary" />;
    case 'ticket_status_changed':
    case 'new_ticket':
      return <TicketIcon color="info" />;
    case 'file_uploaded':
      return <UploadIcon color="success" />;
    default:
      return <NotificationsIcon />;
  }
};

const getTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);
  
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return then.toLocaleDateString();
};

const NotificationModal = ({ open, onClose, onUnreadCountChange }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count after delete
      if (onUnreadCountChange) {
        const res = await notificationAPI.getUnread();
        onUnreadCountChange(res.data.length);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      // Update unread count after marking as read
      if (onUnreadCountChange) {
        const res = await notificationAPI.getUnread();
        onUnreadCountChange(res.data.length);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.ticketId) {
      navigate(`/app/tickets/${notification.ticketId}`);
    } else if (notification.taskId) {
      navigate(`/app/tasks/${notification.taskId}`);
    } else if (notification.type === 'comment_added') {
      // Try to infer ticket or task from message or related fields
      if (notification.message && notification.message.toLowerCase().includes('ticket')) {
        // Try to extract ticket title from message and match to a ticket (not robust, but fallback)
        // Ideally, backend should provide ticketId
        alert('This comment notification is missing a ticket/task link. Please ask your admin to update backend notification logic.');
      } else if (notification.message && notification.message.toLowerCase().includes('task')) {
        alert('This comment notification is missing a ticket/task link. Please ask your admin to update backend notification logic.');
      } else {
        alert('This notification cannot be redirected.');
      }
      console.warn('Notification missing ticketId/taskId:', notification);
    }
  };

  const filteredNotifications = 
    tab === 0
      ? notifications
      : tab === 1
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(33, 33, 33, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          maxHeight: '80vh',
        }
      }}
    >
      <Fade in={open} timeout={600}>
        <Box>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" />
              )}
            </Box>
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 0, pb: 0 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ mb: 2, mt: 1 }}
            >
              <Tab label={`All (${notifications.length})`} />
              <Tab label={`Unread (${unreadCount})`} />
              <Tab label={`Read (${readCount})`} />
            </Tabs>
            
            {unreadCount > 0 && tab === 1 && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Chip
                  label="Mark all as read"
                  onClick={handleMarkAllAsRead}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />
            
            <List sx={{
              overflowY: 'auto',
              maxHeight: '50vh',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}>
              {filteredNotifications.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" color="text.secondary" align="center">
                        {tab === 0 ? 'No notifications yet.' : 
                         tab === 1 ? 'No unread notifications.' : 
                         'No read notifications.'}
                      </Typography>
                    } 
                  />
                </ListItem>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        backgroundColor: !notification.isRead
                          ? theme.palette.action.selected
                          : 'inherit',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                        cursor: 'pointer',
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={e => { e.stopPropagation(); handleDelete(notification.id); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ 
                                fontWeight: !notification.isRead ? 600 : 400,
                                flex: 1,
                                mr: 1
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Chip
                              label={notification.isRead ? 'Read' : 'Unread'}
                              color={notification.isRead ? 'default' : 'primary'}
                              size="small"
                              icon={notification.isRead ? <ReadIcon fontSize="small" /> : <UnreadIcon fontSize="small" />}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {getTimeAgo(notification.createdAt)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </DialogContent>
        </Box>
      </Fade>
    </Dialog>
  );
};

export default NotificationModal; 