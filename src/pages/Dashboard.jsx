import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Rating,
  Badge,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Assignment as AssignmentIcon,
  TaskAlt as TaskAltIcon,
  Apartment as ApartmentIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import useUser from '../context/useUser';
import PageHeader from '../components/layout/PageHeader';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { analyticsAPI } from '../services';

const Dashboard = () => {
  const { user } = useUser();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isTeamPerformanceCollapsed, setIsTeamPerformanceCollapsed] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsAPI.getDashboardStats();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) return <LoadingSpinner overlay message="Loading dashboard..." />;

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Typography variant="h6" color="error">
        Failed to load dashboard data
      </Typography>
    );
  }

  // List of backend fields and labels in order
  const backendStats = [
    { key: 'totalTickets', label: 'Total Tickets' },
    { key: 'openTickets', label: 'Open Tickets' },
    { key: 'closedTickets', label: 'Closed Tickets' },
    { key: 'overdueTickets', label: 'Overdue Tickets' },
    { key: 'totalTasks', label: 'Total Tasks' },
    { key: 'completedTasks', label: 'Completed Tasks' },
    { key: 'overdueTasks', label: 'Overdue Tasks' },
    { key: 'activeUsers', label: 'Active Users' },
  ];

  // Stat card icon and color mapping
  const statCardMeta = {
    totalTickets: { icon: <ConfirmationNumberIcon />, color: 'primary.main', bg: 'primary.light' },
    openTickets: { icon: <WarningIcon />, color: 'error.main', bg: 'error.light' },
    closedTickets: { icon: <CheckCircleIcon />, color: 'success.main', bg: 'success.light' },
    overdueTickets: { icon: <ErrorIcon />, color: 'warning.main', bg: 'warning.light' },
    totalTasks: { icon: <AssignmentIcon />, color: 'secondary.main', bg: 'secondary.light' },
    completedTasks: { icon: <TaskAltIcon />, color: 'success.main', bg: 'success.light' },
    overdueTasks: { icon: <WarningIcon />, color: 'warning.main', bg: 'warning.light' },
    activeUsers: { icon: <PeopleIcon />, color: 'info.main', bg: 'info.light' },
    departments: { icon: <ApartmentIcon />, color: 'primary.dark', bg: 'primary.light' },
  };

  // Helper function to get efficiency rating
  const getEfficiencyRating = (efficiency) => {
    if (efficiency >= 90) return 5;
    if (efficiency >= 80) return 4;
    if (efficiency >= 70) return 3;
    if (efficiency >= 60) return 2;
    return 1;
  };

  // Helper function to get performance color
  const getPerformanceColor = (efficiency) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 80) return 'info';
    if (efficiency >= 70) return 'warning';
    return 'error';
  };

  // Toggle team performance section
  const toggleTeamPerformance = () => {
    setIsTeamPerformanceCollapsed(!isTeamPerformanceCollapsed);
  };

  return (
    <Box sx={{ flexGrow: 1, pt: { xs: 7, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 }, pb: { xs: 8, sm: 12, md: 16 }, display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageHeader 
        title={`Welcome back, ${user?.firstname || user?.name || 'User'}!`}
        subtitle={user?.role === 'department_head' 
          ? `Here's what's happening in your ${user?.department || 'department'} today.`
          : user?.role === 'admin'
          ? 'Here\'s your organization-wide overview and team performance.'
          : 'Here\'s your current tasks and tickets overview.'}
        emoji="👋"
        color="primary"
      />

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        {backendStats.map((stat) => {
          const meta = statCardMeta[stat.key] || {};
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={stat.key}>
              <Card sx={{
                height: '100%',
                borderRadius: 4,
                p: 0,
                bgcolor: 'background.paper',
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 14px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: { xs: 2, sm: 2.5 } }}>
                  <Avatar sx={{
                    width: 54,
                    height: 54,
                    mr: 2,
                    bgcolor: meta.bg,
                    color: meta.color,
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.08)'
                  }}>
                    {meta.icon}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 0.5, 
                        letterSpacing: 0.3, 
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800, 
                        fontSize: { xs: '1.8rem', sm: '2rem', md: '2.2rem' }, 
                        color: 'text.primary', 
                        lineHeight: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {dashboardData[stat.key]}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Activity Section - Show for all users */}
      {(dashboardData.recentTickets || dashboardData.recentTasks) && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Box sx={{ width: 6, height: 32, bgcolor: 'primary.main', borderRadius: 2, mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>Recent Activity</Typography>
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardData.recentTickets && (
              <Grid item xs={12} sm={12} md={6}>
                <Card sx={{
                  borderRadius: 4,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 0.5, color: 'primary.main' }}>Recent Tickets</Typography>
                    {dashboardData.recentTickets.length > 0 ? (
                      <List dense>
                        {dashboardData.recentTickets.map(ticket => (
                          <ListItem key={ticket.id} alignItems="flex-start" sx={{ mb: 1, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <ConfirmationNumberIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Box sx={{ fontWeight: 600 }}>{ticket.title}</Box>}
                              secondary={
                                <Typography variant="body2" color="text.secondary" component="div">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip
                                      label={ticket.status}
                                      size="small"
                                      color={
                                        ticket.status === 'open' || ticket.status === 'pending'
                                          ? 'error'
                                          : (ticket.status === 'closed' || ticket.status === 'completed' || ticket.status === 'resolved')
                                          ? 'success'
                                          : 'warning'
                                      }
                                    />
                                    <Chip label={ticket.priority} size="small" color={ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'success'} />
                                  </Box>
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', py: 2 }}>
                        <ConfirmationNumberIcon color="disabled" />
                        <Typography variant="body2">No recent tickets.</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
            {dashboardData.recentTasks && (
              <Grid item xs={12} sm={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: 0.5, color: 'secondary.main' }}>Recent Tasks</Typography>
                    {dashboardData.recentTasks.length > 0 ? (
                      <List dense>
                        {dashboardData.recentTasks.map(task => (
                          <ListItem key={task.id} alignItems="flex-start" sx={{ mb: 1, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <AssignmentIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Box sx={{ fontWeight: 600 }}>{task.title}</Box>}
                              secondary={
                                <Typography variant="body2" color="text.secondary" component="div">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Chip label={task.status} size="small" color={task.status === 'completed' ? 'success' : task.status === 'pending' ? 'warning' : 'info'} />
                                    <Chip label={task.priority} size="small" color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'} />
                                  </Box>
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', py: 2 }}>
                        <AssignmentIcon color="disabled" />
                        <Typography variant="body2">No recent tasks.</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* Team Performance Section - Show for all users who have team performance data */}
      {dashboardData.teamPerformance && dashboardData.teamPerformance.length > 0 && (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3, 
            mt: 4,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 2, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                {user?.role === 'admin' ? 'Organization Performance' : 'Team Performance'}
              </Typography>
            </Box>
            
            {/* Summary chips when collapsed */}
            {isTeamPerformanceCollapsed && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mr: 2 }}>
                <Chip 
                  label={`${dashboardData.teamPerformance.length} Members`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem', height: 24 }} 
                />
                <Chip 
                  label={`${dashboardData.teamPerformance.reduce((sum, member) => sum + member.tasksCompleted + member.ticketsClosed, 0)} Completed`} 
                  size="small" 
                  color="success" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem', height: 24 }} 
                />
                <Chip 
                  label={`${Math.round(dashboardData.teamPerformance.reduce((sum, member) => {
                    const total = member.tasksAssigned + member.ticketsAssigned;
                    const completed = member.tasksCompleted + member.ticketsClosed;
                    return sum + (total > 0 ? (completed / total) * 100 : 0);
                  }, 0) / dashboardData.teamPerformance.length)}% Avg Efficiency`} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem', height: 24 }} 
                />
              </Box>
            )}
            
            <IconButton
              onClick={toggleTeamPerformance}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark'
                }
              }}
            >
              {isTeamPerformanceCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={!isTeamPerformanceCollapsed}>
            {/* Performance Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 2, 
                    width: 48, 
                    height: 48 
                  }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    {dashboardData.teamPerformance.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mx: 'auto', 
                    mb: 2, 
                    width: 48, 
                    height: 48 
                  }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mb: 1 }}>
                    {dashboardData.teamPerformance.reduce((sum, member) => sum + member.tasksCompleted + member.ticketsClosed, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Tasks and Tickets
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    mx: 'auto', 
                    mb: 2, 
                    width: 48, 
                    height: 48 
                  }}>
                    <SpeedIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mb: 1 }}>
                    {Math.round(dashboardData.teamPerformance.reduce((sum, member) => {
                      const total = member.tasksAssigned + member.ticketsAssigned;
                      const completed = member.tasksCompleted + member.ticketsClosed;
                      return sum + (total > 0 ? (completed / total) * 100 : 0);
                    }, 0) / dashboardData.teamPerformance.length)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Efficiency
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                height: '100%'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'warning.main', 
                    mx: 'auto', 
                    mb: 2, 
                    width: 48, 
                    height: 48 
                  }}>
                    <TrophyIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mb: 1 }}>
                    {dashboardData.teamPerformance.filter(member => {
                      const total = member.tasksAssigned + member.ticketsAssigned;
                      const completed = member.tasksCompleted + member.ticketsClosed;
                      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
                      return efficiency >= 90;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top Performers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Team Members Performance Cards */}
          <Grid container spacing={3}>
            {dashboardData.teamPerformance.map(member => {
              const total = member.tasksAssigned + member.ticketsAssigned;
              const completed = member.tasksCompleted + member.ticketsClosed;
              const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
              const performanceColor = getPerformanceColor(efficiency);
              const taskCompletionRate = member.tasksAssigned > 0 ? Math.round((member.tasksCompleted / member.tasksAssigned) * 100) : 0;
              const ticketCompletionRate = member.ticketsAssigned > 0 ? Math.round((member.ticketsClosed / member.ticketsAssigned) * 100) : 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={member.userId}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: 2, 
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: 4
                    },
                    position: 'relative',
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    {/* Performance Badge */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      zIndex: 1 
                    }}>
                      <Chip
                        label={`${efficiency}%`}
                        size="small"
                        color={performanceColor}
                        icon={efficiency >= 90 ? <TrophyIcon /> : <SpeedIcon />}
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 28
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* User Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: `${performanceColor}.main`, 
                          width: 48, 
                          height: 48,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          mr: 2
                        }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {member.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : ''}
                            {member.departmentName ? ` • ${member.departmentName}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Performance Rating */}
                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Rating 
                          value={getEfficiencyRating(efficiency)} 
                          readOnly 
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Performance Rating
                        </Typography>
                      </Box>

                      {/* Task Metrics */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Tasks
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.tasksCompleted}/{member.tasksAssigned}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={taskCompletionRate} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                            }
                          }}
                          color="secondary"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: {member.tasksAssigned}
                          </Typography>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            Completed: {member.tasksCompleted}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Ticket Metrics */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Tickets
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.ticketsClosed}/{member.ticketsAssigned}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={ticketCompletionRate} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                            }
                          }}
                          color="primary"
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Assigned: {member.ticketsAssigned}
                          </Typography>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            Closed: {member.ticketsClosed}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Overall Efficiency */}
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: `${performanceColor}.50`, 
                        borderRadius: 2,
                        border: `1px solid ${performanceColor === 'success' ? theme.palette.success.main : performanceColor === 'warning' ? theme.palette.warning.main : performanceColor === 'error' ? theme.palette.error.main : theme.palette.info.main}20`
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Overall Efficiency
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 800, 
                            color: `${performanceColor}.main` 
                          }}>
                            {efficiency}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={efficiency} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5, 
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                            }
                          }}
                          color={performanceColor}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          </Collapse>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 