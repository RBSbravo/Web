import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon
} from '@mui/icons-material';

const ReportDetail = ({ report }) => {
  const theme = useTheme();


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in_progress':
      case 'in progress':
        return 'info';
      case 'declined':
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };


  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.length.toString();
      } else {
        return Object.keys(value).length.toString();
      }
    } else if (typeof value === 'string') {
      return value;
    } else {
      return String(value || 'N/A');
    }
  };

  // Format duration from days (used for resolution/completion time)
  const formatDurationFromDays = (days) => {
    if (days === null || days === undefined || isNaN(days) || days < 0) {
      return 'No data';
    }
    
    if (days === 0) {
      return '0 days';
    }
    
    const totalHours = days * 24;
    const totalMinutes = totalHours * 60;
    
    const daysPart = Math.floor(days);
    const hoursPart = Math.floor((days - daysPart) * 24);
    const minutesPart = Math.floor((totalMinutes - (daysPart * 24 * 60) - (hoursPart * 60)));
    
    const parts = [];
    if (daysPart > 0) {
      parts.push(`${daysPart}d`);
    }
    if (hoursPart > 0) {
      parts.push(`${hoursPart}h`);
    }
    if (minutesPart > 0 && daysPart === 0) {
      // Only show minutes if less than a day
      parts.push(`${minutesPart}m`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '< 1m';
  };

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
  };


  // Extract data from report structure
  const reportData = report?.data || report?.metrics || {};
  const reportInfo = report?.report || report;
  
  // Debug: Log the report structure to see filtersApplied
  console.log('Report structure:', report);
  console.log('ReportInfo:', reportInfo);
  console.log('FiltersApplied:', reportInfo?.filtersApplied);

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable Content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 3 
      }}>

      {/* Filters Applied */}
      {(reportInfo?.filtersApplied || report?.filtersApplied) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Filters Applied
            </Typography>
        <Grid container spacing={2}>
              {Object.entries(reportInfo.filtersApplied || report.filtersApplied).map(([key, value]) => {
                let displayValue = '';
                if (typeof value === 'string') {
                  displayValue = value;
                } else if (typeof value === 'number') {
                  displayValue = value.toString();
                } else if (typeof value === 'object' && value !== null) {
                  if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else {
                    displayValue = JSON.stringify(value);
                  }
                } else {
                  displayValue = String(value || 'N/A');
                }

                return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {displayValue}
                      </Typography>
              </Box>
            </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      {reportData?.summary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Summary
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(reportData.summary).map(([key, value]) => {
                // Check if this is a time/duration field that should be formatted specially
                const isTimeField = key.toLowerCase().includes('time') || key.toLowerCase().includes('duration');
                const displayValue = isTimeField && typeof value === 'number' 
                  ? formatDurationFromDays(value)
                  : formatValue(value);
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {displayValue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
        </Grid>
                </CardContent>
              </Card>
      )}

      {/* Status/Priority Breakdown */}
      {(reportData?.statusBreakdown || reportData?.priorityBreakdown) && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {reportData.statusBreakdown && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Status Breakdown
                  </Typography>
                  {reportData.statusBreakdown.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={item.status} 
                        color={getStatusColor(item.status)} 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {item.count} ({item.percentage}%)
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {reportData.priorityBreakdown && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Priority Breakdown
                  </Typography>
                  {reportData.priorityBreakdown.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={item.priority} 
                        color={getPriorityColor(item.priority)} 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* User/Department Profile */}
      {(reportData?.userProfile || reportData?.departmentProfile) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {reportData.userProfile ? 'User Profile' : 'Department Profile'}
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(reportData.userProfile || reportData.departmentProfile).map(([key, value]) => {
                // Check if this is a time/duration field that should be formatted specially
                const isTimeField = key.toLowerCase().includes('time') || key.toLowerCase().includes('duration');
                let displayValue = '';
                if (typeof value === 'string') {
                  displayValue = value;
                } else if (typeof value === 'number') {
                  displayValue = isTimeField 
                    ? formatDurationFromDays(value)
                    : value.toString();
                } else if (typeof value === 'object' && value !== null) {
                  if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else {
                    displayValue = JSON.stringify(value);
                  }
                } else {
                  displayValue = String(value || 'N/A');
                }

      return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {displayValue}
                      </Typography>
                  </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Custom Report Metrics */}
      {report?.type === 'custom' && reportData?.customMetrics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Custom Metrics
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(reportData.customMetrics).map(([key, value]) => {
                // Check if this is a time/duration field that should be formatted specially
                const isTimeField = key.toLowerCase().includes('time') || key.toLowerCase().includes('duration');
                const displayValue = isTimeField && typeof value === 'number' 
                  ? formatDurationFromDays(value)
                  : formatValue(value);
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={key}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {displayValue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Details Table */}
      {reportData?.details && reportData.details.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Details
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {Object.keys(reportData.details[0]).map((key) => (
                      <TableCell key={key} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.details.map((row, index) => (
                    <TableRow key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <TableCell key={key}>
                          {key.toLowerCase().includes('status') ? (
                            <Chip
                              label={value}
                              color={getStatusColor(value)} 
                              size="small"
                              variant="outlined"
                            />
                          ) : key.toLowerCase().includes('priority') ? (
                            <Chip
                              label={value} 
                              color={getPriorityColor(value)} 
                              size="small"
                              variant="outlined"
                            />
                          ) : key.toLowerCase().includes('date') ? (
                            formatDate(value)
                          ) : (
                            value || 'N/A'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Table */}
      {reportData?.activity && reportData.activity.length > 0 && (
        <Card sx={{ mb: 3 }}>
            <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Activity
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {Object.keys(reportData.activity[0]).map((key) => (
                      <TableCell key={key} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {formatKey(key)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.activity.map((row, index) => (
                    <TableRow key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <TableCell key={key}>
                          {key.toLowerCase().includes('status') ? (
                            <Chip
                              label={value}
                              color={getStatusColor(value)} 
                              size="small"
                              variant="outlined"
                            />
                          ) : key.toLowerCase().includes('priority') ? (
                            <Chip
                              label={value}
                              color={getPriorityColor(value)} 
                              size="small"
                              variant="outlined"
                            />
                          ) : key.toLowerCase().includes('date') ? (
                            formatDate(value)
                          ) : (
                            value || 'N/A'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </CardContent>
          </Card>
      )}

      {/* Data Tables for Custom Reports */}
      {report?.type === 'custom' && (
        <>
          {/* Tasks Table */}
          {reportData?.tasks && reportData.tasks.length > 0 && (
            <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Tasks ({reportData.tasks.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.tasks.slice(0, 10).map((task, index) => (
                        <TableRow key={index}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              color={getStatusColor(task.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority || 'Medium'} 
                              color={getPriorityColor(task.priority)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {task.taskAssignee ? 
                              `${task.taskAssignee.firstname} ${task.taskAssignee.lastname}` : 
                              'Unassigned'
                            }
                          </TableCell>
                          <TableCell>{formatDate(task.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {reportData.tasks.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showing first 10 of {reportData.tasks.length} tasks
                  </Typography>
                )}
            </CardContent>
          </Card>
          )}

          {/* Tickets Table */}
          {reportData?.tickets && reportData.tickets.length > 0 && (
            <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Tickets ({reportData.tickets.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.tickets.slice(0, 10).map((ticket, index) => (
                        <TableRow key={index}>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status}
                              color={getStatusColor(ticket.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.priority || 'Medium'} 
                              color={getPriorityColor(ticket.priority)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {ticket.ticketAssignee ? 
                              `${ticket.ticketAssignee.firstname} ${ticket.ticketAssignee.lastname}` : 
                              'Unassigned'
                            }
                          </TableCell>
                          <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {reportData.tickets.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showing first 10 of {reportData.tickets.length} tickets
                  </Typography>
                )}
            </CardContent>
          </Card>
          )}

          {/* Users Table */}
          {reportData?.users && reportData.users.length > 0 && (
            <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Users ({reportData.users.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.users.slice(0, 10).map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {user.firstname?.[0]}{user.lastname?.[0]}
                              </Avatar>
                              {user.firstname} {user.lastname}
              </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role} 
                              color={user.role === 'admin' ? 'error' : user.role === 'department_head' ? 'warning' : 'default'} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{user.department?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.isActive ? 'Active' : 'Inactive'} 
                              color={user.isActive ? 'success' : 'default'} 
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {reportData.users.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showing first 10 of {reportData.users.length} users
                  </Typography>
                )}
            </CardContent>
          </Card>
          )}

          {/* Departments Table */}
          {reportData?.departments && reportData.departments.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Departments ({reportData.departments.length})
                      </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Employees</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.departments.slice(0, 10).map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BusinessIcon color="info" />
                              {dept.name}
                    </Box>
                          </TableCell>
                          <TableCell>{dept.description || 'N/A'}</TableCell>
                          <TableCell>{dept.users?.length || 0}</TableCell>
                          <TableCell>
                            <Chip 
                              label={dept.isActive ? 'Active' : 'Inactive'} 
                              color={dept.isActive ? 'success' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {reportData.departments.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    Showing first 10 of {reportData.departments.length} departments
                      </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </>
          )}

      {/* Insights */}
      {reportData?.insights && Object.keys(reportData.insights).length > 0 && (
        <Card sx={{ mb: 3 }}>
              <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Insights
                      </Typography>
            <Grid container spacing={3}>
              {Object.entries(reportData.insights).map(([key, value]) => {
                // Format the key to be more readable
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim()
                  .replace(/^./, str => str.toUpperCase());
                
                // Format the value based on the key type and content
                let displayValue = '';
                let isPercentage = false;
                let isTime = false;
                
                if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage') || key.toLowerCase().includes('compliance')) {
                  isPercentage = true;
                }
                
                if (key.toLowerCase().includes('time') || key.toLowerCase().includes('duration')) {
                  isTime = true;
                }
                
                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    displayValue = 'No data';
                  } else if (value.every(item => typeof item === 'object')) {
                    // Handle array of objects (like workload distribution)
                    displayValue = value.map(item => {
                      if (typeof item === 'object' && item !== null) {
                        const entries = Object.entries(item);
                        if (entries.length === 2) {
                          const [name, data] = entries;
                          if (typeof data === 'object' && data !== null) {
                            const dataEntries = Object.entries(data);
                            if (dataEntries.length > 0) {
                              return `${name}: ${dataEntries.map(([k, v]) => `${k}: ${v}`).join(', ')}`;
                            }
                          }
                          return `${name}: ${data}`;
                        }
                        return JSON.stringify(item);
                      }
                      return String(item);
                    }).join('; ');
                  } else {
                    displayValue = value.join(', ');
                  }
                } else if (typeof value === 'object' && value !== null) {
                  // Handle objects (like workload distribution, priority distribution)
                  const entries = Object.entries(value);
                  if (entries.length === 0) {
                    displayValue = 'No data';
                  } else if (entries.length <= 3) {
                    // For small objects, show as key-value pairs
                    displayValue = entries.map(([k, v]) => {
                      if (typeof v === 'object' && v !== null) {
                        const subEntries = Object.entries(v);
                        if (subEntries.length > 0) {
                          return `${k}: ${subEntries.map(([sk, sv]) => `${sk}: ${sv}`).join(', ')}`;
                        }
                      }
                      return `${k}: ${v}`;
                    }).join('; ');
                  } else {
                    // For large objects, show count
                    displayValue = `${entries.length} items`;
                  }
                } else if (typeof value === 'number') {
                  if (isPercentage) {
                    displayValue = `${value.toFixed(1)}%`;
                  } else if (isTime) {
                    // Use the improved duration formatter
                    displayValue = formatDurationFromDays(value);
                  } else {
                    displayValue = value.toLocaleString();
                  }
                } else if (typeof value === 'string') {
                  displayValue = value;
                } else if (value === null || value === undefined) {
                  displayValue = 'N/A';
                } else {
                  displayValue = String(value);
                }

                return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box sx={{ 
                      p: 2, 
                      border: `1px solid ${theme.palette.divider}`, 
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      height: '100%'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        {formattedKey}
                      </Typography>
                      <Typography 
                        variant="body1" 
                      sx={{ 
                          fontWeight: 600, 
                          color: theme.palette.primary.main,
                          wordBreak: 'break-word',
                          lineHeight: 1.4
                        }}
                      >
                        {displayValue}
                      </Typography>
                  </Box>
                  </Grid>
                );
              })}
            </Grid>
              </CardContent>
            </Card>
          )}

        </Box>
    </Box>
  );
};

export default ReportDetail;