/**
 * Task Table View Component - Desktop table layout similar to ticket page
 */

import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  useTheme,
  useMediaQuery
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

const TaskTableView = ({
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflowX: 'auto', width: '100%', maxWidth: '100vw', bgcolor: 'background.paper' }}>
        <Table size="medium" sx={{ minWidth: { md: 0, lg: 900 }, width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 120, lg: 220 }, minWidth: 80 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 80, lg: 160 } }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 80, lg: 160 } }}>Due Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, minWidth: { md: 60, lg: 80 } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, idx) => {
              const assignee = departmentUsers.find(u => u.id === task.assignedToId);
              const assigneeName = formatAssigneeName(assignee);
              
              return (
                <TableRow key={task.id} hover sx={{ bgcolor: idx % 2 === 0 ? 'background.default' : 'background.paper', transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: { md: 22, lg: 32 }, height: { md: 22, lg: 32 }, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                      {getStatusIcon(task.status)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ maxWidth: { md: 120, lg: 220 }, minWidth: 80, px: { md: 0.5, lg: 2 } }}>
                    <Tooltip title={task.title} arrow>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 } }}>
                        {task.title}
                      </Typography>
                    </Tooltip>
                    <Tooltip title={task.description} arrow>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { md: '0.8rem', lg: '0.92rem' }, lineHeight: 1.4, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 } }}>
                        {task.description}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      icon={getPriorityIcon(task.priority)}
                      sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 70 }, justifyContent: 'center' }}
                    />
                  </TableCell>
                  <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                    <Chip
                      label={(task.status || '').replace('_', ' ')}
                      size="small"
                      color={getStatusColor(task.status)}
                      sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 90 }, justifyContent: 'center' }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: { md: 80, lg: 160 }, px: { md: 0.5, lg: 2 } }}>
                    <Typography variant="caption" color={assigneeName !== 'Unassigned' ? 'text.secondary' : 'text.disabled'} sx={{ fontSize: '0.78rem', fontStyle: assigneeName !== 'Unassigned' ? 'normal' : 'italic' }}>
                      {assigneeName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: { md: 80, lg: 160 }, px: { md: 0.5, lg: 2 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {task.dueDate && (
                        <Tooltip title={formatDate(task.dueDate)} arrow>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: { md: 13, lg: 16 } }} color="action" />
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: { md: '0.7rem', lg: '0.78rem' }, maxWidth: { md: 60, lg: 70 } }}>
                              {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                      {(() => {
                        const maturityColor = getTaskMaturityColor(task);
                        const maturityText = getTaskMaturityText(task);
                        
                        if (!maturityColor || !maturityText) {
                          return null;
                        }
                        
                        return (
                          <Tooltip title={`Maturity: ${maturityText}`} arrow>
                            <span>
                              <Chip
                                label={maturityText}
                                size="small"
                                color={maturityColor}
                                sx={{ 
                                  fontSize: { md: '0.6rem', lg: '0.7rem' }, 
                                  fontWeight: 600, 
                                  borderRadius: 2, 
                                  px: 0.5, 
                                  height: { md: 14, lg: 18 }, 
                                  boxShadow: 1, 
                                  minWidth: { lg: 60 }, 
                                  justifyContent: 'center' 
                                }}
                              />
                            </span>
                          </Tooltip>
                        );
                      })()}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: { md: 60, lg: 80 }, px: { md: 0.5, lg: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, flexWrap: 'wrap', justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
                      <Tooltip title="View Details"><span><IconButton color="primary" size="small" onClick={() => onViewDetails(task)}><VisibilityIcon fontSize="small" /></IconButton></span></Tooltip>
                      <Tooltip title="Edit Task"><span><IconButton color="secondary" size="small" onClick={() => onEditTask(task)}><EditIcon fontSize="small" /></IconButton></span></Tooltip>
                      <Tooltip title="Delete Task"><span><IconButton color="error" size="small" onClick={() => onDeleteTask(task)}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskTableView;
