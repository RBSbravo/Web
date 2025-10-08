/**
 * Task Card View Component - Mobile card layout similar to ticket page
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card
} from '@mui/material';
import {
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
  formatAssigneeName,
  getTaskMaturityColor,
  getTaskMaturityText
} from '../../utils/taskUtils';
import { formatDate } from '../../utils/ticketUtils';

const TaskCardView = ({
  tasks,
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
}) => {
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <TrendingUpIcon />;
      case 'medium':
        return <ScheduleIcon />;
      case 'low':
        return <TaskIcon />;
      default:
        return <TaskIcon />;
    }
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Grid container spacing={2}>
        {tasks.map((task) => {
          const assignee = departmentUsers.find(u => u.id === task.assignedToId);
          const assigneeName = formatAssigneeName(assignee);
          
          return (
            <Grid item xs={12} key={task.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mr: 1 }}>
                    {getStatusIcon(task.status)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', wordBreak: 'break-word' }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.92rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {task.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                    icon={getPriorityIcon(task.priority)}
                    sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                  />
                  <Chip
                    label={(task.status || '').replace('_', ' ')}
                    size="small"
                    color={getStatusColor(task.status)}
                    sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                  />
                  {(() => {
                    const maturityColor = getTaskMaturityColor(task);
                    const maturityText = getTaskMaturityText(task);
                    
                    if (!maturityColor || !maturityText) {
                      return null;
                    }
                    
                    return (
                      <Chip
                        label={maturityText}
                        size="small"
                        color={maturityColor}
                        sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                      />
                    );
                  })()}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16 }} color="action" />
                  <Typography variant="caption" color={assigneeName !== 'Unassigned' ? 'text.secondary' : 'text.disabled'} sx={{ fontSize: '0.78rem', fontStyle: assigneeName !== 'Unassigned' ? 'normal' : 'italic' }}>
                    {assigneeName}
                  </Typography>
                  {task.dueDate && (
                    <>
                      <CalendarIcon sx={{ fontSize: 16, ml: 1 }} color="action" />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                        {formatDate(task.dueDate)}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
                  <Tooltip title="View Details"><span><IconButton color="primary" size="small" onClick={() => onViewDetails(task)}><VisibilityIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Edit Task"><span><IconButton color="secondary" size="small" onClick={() => onEditTask(task)}><EditIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Delete Task"><span><IconButton color="error" size="small" onClick={() => onDeleteTask(task)}><DeleteIcon /></IconButton></span></Tooltip>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TaskCardView;
