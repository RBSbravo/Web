import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as TaskIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
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
import LoadingSpinner from '../components/layout/LoadingSpinner';
import UserContext from '../context/UserContext';
import { analyticsAPI } from '../services/api';
import PageHeader from '../components/layout/PageHeader';

const Analytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const { user } = React.useContext(UserContext);

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user && user.role === 'department_head' && user.departmentId) {
      loadDepartmentAnalytics(user.departmentId);
    } else {
      // fallback: load mock or general analytics
      setLoading(false);
      setError('No department analytics available.');
    }
    // eslint-disable-next-line
  }, [user]);

  const loadDepartmentAnalytics = async (departmentId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading analytics for department:', departmentId);
      const { data } = await analyticsAPI.getDepartmentAnalytics(departmentId);
      console.log('Analytics data received:', data);
        setAnalyticsData(data);
        setLoading(false);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load department analytics');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner overlay message="Loading analytics..." />;

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  if (!analyticsData) {
    return (
      <Typography variant="h6" color="error">
        Failed to load analytics data
      </Typography>
    );
  }

  // Debug: Log the actual analytics data structure
  console.log('analyticsData:', analyticsData);

  // Defensive checks for expected arrays
  const departmentStats = Array.isArray(analyticsData?.departmentStats) ? analyticsData.departmentStats : [];
  const taskMetrics = Array.isArray(analyticsData?.taskMetrics) ? analyticsData.taskMetrics : [];
  const ticketMetrics = Array.isArray(analyticsData?.ticketMetrics) ? analyticsData.ticketMetrics : [];
  const userPerformance = Array.isArray(analyticsData?.userPerformance) ? analyticsData.userPerformance : [];

  return (
    <Box sx={{ flexGrow: 1, pt: { xs: 7, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader 
        title="Department Analytics" 
        subtitle="Comprehensive insights into your department's performance and productivity"
        emoji="📈"
        color="secondary"
        onRefresh={() => user?.departmentId && loadDepartmentAnalytics(user.departmentId)}
      />

      {/* Scrollable Content */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
        <Fade in={true} timeout={800}>
          <Box>
          {/* Department Stats */}
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            {departmentStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: isMobile ? 'none' : 'translateY(-4px)',
                      boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: { xs: 1.5, sm: 2 } 
                    }}>
                      <Box
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: '50%',
                          backgroundColor: `${stat.changeType === 'positive' ? 'success' : 'error'}.light`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: `${stat.changeType === 'positive' ? 'success' : 'error'}.main`,
                        }}
                      >
                        {stat.changeType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      </Box>
                      <Chip
                        label={stat.change}
                        size="small"
                        color={stat.changeType === 'positive' ? 'success' : 'error'}
                        icon={stat.changeType === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      {stat.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {/* Task Metrics */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      mb: { xs: 1.5, sm: 2 }
                    }}
                  >
                    Task Completion Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                    <BarChart data={taskMetrics.filter(item => item.name !== 'Total')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="completed" fill={theme.palette.success.main} name="Completed" />
                      <Bar dataKey="inProgress" fill={theme.palette.warning.main} name="In Progress" />
                      <Bar dataKey="pending" fill={theme.palette.error.main} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Ticket Metrics */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      mb: { xs: 1.5, sm: 2 }
                    }}
                  >
                    Ticket Resolution Rate
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                    {(() => {
                      const data = ticketMetrics.filter(item => item.name !== 'Total');
                      const series = [
                        { key: 'resolved', color: theme.palette.success.main, name: 'Resolved' },
                        { key: 'open', color: theme.palette.warning.main, name: 'Open' },
                        { key: 'pending', color: theme.palette.error.main, name: 'Pending' },
                        { key: 'inProgress', color: theme.palette.secondary.main, name: 'In Progress' },
                      ];
                      const available = series.filter(s => data.some(d => d[s.key] !== undefined && d[s.key] !== null));
                      return (
                        <LineChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                          <YAxis fontSize={isMobile ? 10 : 12} />
                          <RechartsTooltip />
                          <Legend />
                          {available.map(s => (
                            <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} name={s.name} />
                          ))}
                        </LineChart>
                      );
                    })()}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* User Performance */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      mb: { xs: 1.5, sm: 2 }
                    }}
                  >
                    Team Performance Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                    <BarChart data={userPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={isMobile ? 10 : 12}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 80 : 60}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} />
                      <RechartsTooltip 
                        formatter={(value, name, props) => {
                          const user = props.payload;
                          const role = user?.role;
                          
                          if (name === 'efficiency') {
                            const efficiencyType = role === 'department_head' ? 'Ticket Efficiency' : 'Task Efficiency';
                            return [`${value}%`, efficiencyType];
                          }
                          if (name === 'tasks') {
                            return [value, 'Tasks Completed'];
                          }
                          if (name === 'tickets') {
                            return [value, 'Tickets Managed'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const user = payload[0].payload;
                            const role = user?.role;
                            const roleLabel = role === 'department_head' ? 'Department Head' : 'Employee';
                            return `${label} (${roleLabel})`;
                          }
                          return label;
                        }}
                      />
                      <Legend />
                      {/* Dynamic bars based on user roles */}
                      {(() => {
                        const hasDepartmentHeads = userPerformance.some(user => user.role === 'department_head');
                        const hasEmployees = userPerformance.some(user => user.role === 'employee');
                        
                        return (
                          <>
                            {/* Show tasks bar only if there are employees */}
                            {hasEmployees && (
                              <Bar 
                                dataKey="tasks" 
                                fill={theme.palette.success.main} 
                                name="Tasks Completed"
                              />
                            )}
                            {/* Show tickets bar only if there are department heads */}
                            {hasDepartmentHeads && (
                              <Bar 
                                dataKey="tickets" 
                                fill={theme.palette.info.main} 
                                name="Tickets Managed"
                              />
                            )}
                            {/* Always show efficiency */}
                            <Bar dataKey="efficiency" fill={theme.palette.warning.main} name="Efficiency %" />
                          </>
                        );
                      })()}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>
      </Box>
    </Box>
  );
};

export default Analytics; 