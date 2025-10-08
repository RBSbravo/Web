/**
 * Task List Item Component
 */

import React, { useState, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import {
  getPriorityColor,
  getStatusColor,
  formatAssigneeName
} from '../../utils/taskUtils';
import { formatDate } from '../../utils/ticketUtils';

const TaskListItem = memo(function TaskListItem({
  task,
  departmentUsers,
  canUpdateTask,
  selectedTasks,
  updatingStatus,
  updatingPriority,
  onSelectTask,
  onViewDetails,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
  onUpdatePriority
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [priorityMenuAnchor, setPriorityMenuAnchor] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <TrendingUpIcon />;
      case 'pending':
        return <ScheduleIcon />;
      default:
        return <TaskIcon />;
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleViewDetails = () => {
    onViewDetails(task);
    handleMenuClose();
  };

  const handleEdit = () => {
    onEditTask(task);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteTask(task);
    handleMenuClose();
  };

  // Assignee lookup
  const assignee = departmentUsers.find(u => u.id === task.assignedToId);
  const assigneeName = formatAssigneeName(assignee);

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1, sm: 1.5, md: 2 },
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: { xs: 64, sm: 72, md: 80 },
        mb: 1,
        background: { xs: 'rgba(0,0,0,0.01)', sm: 'rgba(0,0,0,0.01)', md: 'inherit' },
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-1px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      {/* Checkbox for bulk selection */}
      <Checkbox
        checked={selectedTasks.includes(task.id)}
        onChange={() => onSelectTask(task.id)}
        size="small"
        sx={{ mr: 1, flexShrink: 0 }}
      />
      
      {/* Avatar */}
      <Avatar 
        sx={{ 
          bgcolor: 'primary.main', 
          width: { xs: 32, sm: 36, md: 40 }, 
          height: { xs: 32, sm: 36, md: 40 }, 
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', 
          flexShrink: 0, 
          mr: { xs: 1, sm: 1.5, md: 2 } 
        }}
      >
        {getStatusIcon(task.status)}
      </Avatar>
      
      {/* Main content area */}
      <Box sx={{ 
        flex: 1, 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: { xs: 0.5, sm: 0.8, md: 1 },
        alignItems: { md: 'center' }
      }}>
        {/* Left section: Title and Description */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 0.3, sm: 0.4, md: 0.5 }
        }}>
          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Typography 
              variant="subtitle1" 
              component="div"
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '0.98rem', sm: '1.05rem', md: '1.12rem', lg: '1.18rem' }, 
                letterSpacing: 0.1, 
                lineHeight: 1.2, 
                color: 'text.primary', 
                wordBreak: 'break-word', 
                flex: 1, 
                minWidth: 0 
              }}
              noWrap
            >
              {task.title}
            </Typography>
            
            {/* Menu button - only visible on mobile/tablet */}
            <IconButton
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', background: 'rgba(46,125,50,0.08)' },
                width: { xs: 28, sm: 32, md: 36 },
                height: { xs: 28, sm: 32, md: 36 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                fontSize: '1rem',
                ml: 1,
                flexShrink: 0,
                display: { xs: 'flex', md: 'none' },
              }}
              onClick={handleMenuOpen}
              size="small"
              aria-label="Task actions"
            >
              <MoreVertIcon fontSize="inherit" />
            </IconButton>
          </Box>
          
          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.82rem', sm: '0.85rem', md: '0.88rem', lg: '0.92rem' }, 
              lineHeight: 1.4, 
              wordBreak: 'break-word', 
              maxHeight: { xs: 16, sm: 20, md: 24 }, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              width: '100%',
              display: { xs: 'block', md: '-webkit-box' },
              WebkitLineClamp: { xs: 1, md: 2 },
              WebkitBoxOrient: { xs: 'horizontal', md: 'vertical' }
            }}
            noWrap={false}
          >
            {task.description}
          </Typography>
        </Box>
        
        {/* Right section: Status, Priority, and Meta info */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 0.5, sm: 0.8, md: 1.5 },
          flexShrink: 0,
          minWidth: { md: 'fit-content' }
        }}>
          {/* Status and Priority Chips */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 0.6, md: 0.8 }, 
            flexWrap: 'wrap',
            order: { xs: 1, md: 1 }
          }}>
            <Chip
              label={task.priority}
              size="small"
              color={getPriorityColor(task.priority)}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem', lg: '0.78rem' }, 
                fontWeight: 600, 
                borderRadius: 2, 
                px: { xs: 0.6, sm: 0.8, md: 1 }, 
                height: { xs: 18, sm: 20, md: 22 }
              }}
              onClick={canUpdateTask ? (e) => setPriorityMenuAnchor(e.currentTarget) : undefined}
              clickable={canUpdateTask}
              disabled={updatingPriority === task.id}
            />
            <Chip
              label={(task.status || '').replace('_', ' ')}
              size="small"
              color={getStatusColor(task.status)}
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem', lg: '0.78rem' }, 
                fontWeight: 600, 
                borderRadius: 2, 
                px: { xs: 0.6, sm: 0.8, md: 1 }, 
                height: { xs: 18, sm: 20, md: 22 }
              }}
              onClick={canUpdateTask ? (e) => setStatusMenuAnchor(e.currentTarget) : undefined}
              clickable={canUpdateTask}
              disabled={updatingStatus === task.id}
            />
            {(updatingStatus === task.id || updatingPriority === task.id) && (
              <CircularProgress size={12} sx={{ ml: 0.5 }} />
            )}
          </Box>
          
          {/* Meta info: Assignee and Due Date */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.7, sm: 1, md: 1.5 }, 
            flexWrap: 'wrap',
            order: { xs: 2, md: 2 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.2, sm: 0.3, md: 0.4 },
              minWidth: 'fit-content'
            }}>
              <PersonIcon sx={{ 
                fontSize: { xs: 13, sm: 14, md: 16 } 
              }} color="action" />
              <Typography
                variant="caption"
                color={assigneeName !== 'Unassigned' ? 'text.secondary' : 'text.disabled'}
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem', lg: '0.78rem' }, 
                  fontStyle: assigneeName !== 'Unassigned' ? 'normal' : 'italic',
                  whiteSpace: 'nowrap'
                }}
                component="span"
              >
                {assigneeName}
              </Typography>
            </Box>
            {task.dueDate && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.2, sm: 0.3, md: 0.4 },
                minWidth: 'fit-content'
              }}>
                <CalendarIcon sx={{ 
                  fontSize: { xs: 13, sm: 14, md: 16 } 
                }} color="action" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem', lg: '0.78rem' },
                    whiteSpace: 'nowrap'
                  }}
                  component="span"
                >
                  {formatDate(task.dueDate)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Action buttons - desktop only */}
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' }, 
        alignItems: 'center', 
        gap: 1,
        ml: 2
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          px: 1,
          py: 0.5,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Tooltip title="View Details">
            <IconButton
              sx={{
                color: 'primary.main',
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'primary.light', color: 'white' },
                width: 32,
                height: 32,
                borderRadius: 2
              }}
              onClick={handleViewDetails}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Task">
            <IconButton
              sx={{
                color: 'info.main',
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'info.main', color: 'white' },
                width: 32,
                height: 32,
                borderRadius: 2
              }}
              onClick={handleEdit}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Task">
            <IconButton
              sx={{
                color: 'error.main',
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'error.main', color: 'white' },
                width: 32,
                height: 32,
                borderRadius: 2
              }}
              onClick={handleDelete}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
      
      {/* Status Update Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem 
          onClick={() => { 
            onUpdateStatus(task.id, 'pending'); 
            setStatusMenuAnchor(null); 
          }}
          disabled={task.status === 'pending'}
        >
          Pending
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            onUpdateStatus(task.id, 'in_progress'); 
            setStatusMenuAnchor(null); 
          }}
          disabled={task.status === 'in_progress'}
        >
          In Progress
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            onUpdateStatus(task.id, 'completed'); 
            setStatusMenuAnchor(null); 
          }}
          disabled={task.status === 'completed'}
        >
          Completed
        </MenuItem>
      </Menu>

      {/* Priority Update Menu */}
      <Menu
        anchorEl={priorityMenuAnchor}
        open={Boolean(priorityMenuAnchor)}
        onClose={() => setPriorityMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem 
          onClick={() => { 
            onUpdatePriority(task.id, 'low'); 
            setPriorityMenuAnchor(null); 
          }}
          disabled={task.priority === 'low'}
        >
          Low
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            onUpdatePriority(task.id, 'medium'); 
            setPriorityMenuAnchor(null); 
          }}
          disabled={task.priority === 'medium'}
        >
          Medium
        </MenuItem>
        <MenuItem 
          onClick={() => { 
            onUpdatePriority(task.id, 'high'); 
            setPriorityMenuAnchor(null); 
          }}
          disabled={task.priority === 'high'}
        >
          High
        </MenuItem>
      </Menu>
    </Paper>
  );
});

export default TaskListItem; 