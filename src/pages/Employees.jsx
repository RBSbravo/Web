import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Fade,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import useUser from '../context/useUser';
import { userAPI } from '../services';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import PageHeader from '../components/layout/PageHeader';
import { FixedSizeList as VirtualizedList } from 'react-window';

const Employees = () => {
  const theme = useTheme();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDepartmentName = (emp) => {
    return (
      emp?.department?.name ||
      emp?.departmentName ||
      emp?.department ||
      emp?.department_id ||
      emp?.departmentId ||
      'N/A'
    );
  };

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    departmentId: user?.departmentId || '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      let employeesRes;
      if (user.role === 'admin') {
        employeesRes = await userAPI.getAll();
      } else if (user.role === 'department_head') {
        employeesRes = await userAPI.getDepartmentUsers(user.departmentId);
      } else {
        employeesRes = { data: [] };
      }
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error('Failed to load employees', err);
      // TODO: Add user-facing error message
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        email: employee.email,
        firstName: employee.firstname || employee.firstName,
        lastName: employee.lastname || employee.lastName,
        role: employee.role,
        departmentId: employee.departmentId,
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        departmentId: user?.departmentId || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
  };

  const handleOpenView = (employee) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEmployee) {
        // Update employee
        await userAPI.update(selectedEmployee.id, formData);
      } else {
        // Create new employee
        await userAPI.create(formData);
      }
      
      handleCloseDialog();
      loadEmployees();
    } catch (err) {
      console.error('Failed to save employee', err);
    }
  };

  const filteredEmployees = employees
    .filter(employee => employee.role === 'employee')
    .filter(employee => {
    const matchesSearch = 
        (employee.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (employee.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (employee.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (employee.username?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <LoadingSpinner overlay message="Loading employees..." />;

  return (
    <Box sx={{ flexGrow: 1, pt: { xs: 7, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader 
        title="Employees" 
        subtitle="Manage your department's employees."
        emoji="🧑‍💼"
        color="primary"
        onRefresh={loadEmployees}
      />
      {/* Scrollable Content */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
      <Fade in={true} timeout={800}>
        <Box>

          {/* Filter/Search Card */}
          <Card sx={{ mb: { xs: 3, sm: 4, md: 5 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={8} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon color="action" />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Employees List */}
            {filteredEmployees.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1">No employees found. Try adjusting your search query.</Typography>
              </Box>
            ) : (
              <>
                {/* Table for md and up */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflowX: 'auto', width: '100%', maxWidth: '100vw', bgcolor: 'background.paper' }}>
                    <Table size="medium" sx={{ minWidth: { md: 0, lg: 900 }, width: '100%', tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                          <TableCell padding="checkbox" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 36, lg: 48 } }} />
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>Avatar</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 120, lg: 220 }, minWidth: 80 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, maxWidth: { md: 120, lg: 220 }, minWidth: 80 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Department</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, borderBottom: '2px solid', borderColor: 'divider', px: { md: 0.5, lg: 2 }, minWidth: { md: 60, lg: 80 } }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredEmployees.map((employee, idx) => (
                          <TableRow key={employee.id} hover sx={{ bgcolor: idx % 2 === 0 ? 'background.default' : 'background.paper', transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell padding="checkbox" sx={{ px: { md: 0.5, lg: 2 }, width: { md: 36, lg: 48 } }} />
                            <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 56, lg: 80 } }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: { md: 32, lg: 40 }, height: { md: 32, lg: 40 }, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                                <PersonIcon />
                              </Avatar>
                            </TableCell>
                            <TableCell sx={{ maxWidth: { md: 120, lg: 220 }, minWidth: 80, px: { md: 0.5, lg: 2 } }}>
                              <Tooltip title={`${employee.firstname} ${employee.lastname}`} arrow>
                                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, fontSize: { md: '0.92rem', lg: '1rem' }, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 } }}>
                                  {employee.firstname} {employee.lastname}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ maxWidth: { md: 120, lg: 220 }, minWidth: 80, px: { md: 0.5, lg: 2 } }}>
                              <Tooltip title={employee.email} arrow>
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: { md: '0.8rem', lg: '0.92rem' }, lineHeight: 1.4, wordBreak: 'break-word', maxWidth: { md: 110, lg: 200 } }}>
                                  {employee.email}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                              <Chip
                                label={employee.role}
                                size="small"
                                color={employee.role === 'admin' ? 'error' : employee.role === 'department_head' ? 'primary' : 'success'}
                                sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 70 }, justifyContent: 'center' }}
                              />
                            </TableCell>
                            <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                              <Chip
                                label={getDepartmentName(employee)}
                                size="small"
                                color="info"
                                sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 70 }, justifyContent: 'center' }}
                              />
                            </TableCell>
                            <TableCell sx={{ px: { md: 0.5, lg: 2 }, width: { md: 60, lg: 120 }, maxWidth: { md: 80, lg: 160 } }}>
                              <Chip
                                label={employee.status || 'active'}
                                size="small"
                                color={employee.status === 'inactive' ? 'default' : 'success'}
                                sx={{ fontSize: { md: '0.65rem', lg: '0.78rem' }, fontWeight: 600, borderRadius: 2, px: 1, height: { md: 16, lg: 22 }, boxShadow: 1, minWidth: { lg: 70 }, justifyContent: 'center' }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: { md: 60, lg: 80 }, px: { md: 0.5, lg: 2 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, flexWrap: 'wrap', justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
                                <Tooltip title="View"><span><IconButton color="primary" size="small" onClick={() => handleOpenView(employee)}><ViewIcon fontSize="small" /></IconButton></span></Tooltip>
                                <Tooltip title="Edit"><span><IconButton color="secondary" size="small" onClick={() => handleOpenDialog(employee)}><EditIcon fontSize="small" /></IconButton></span></Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                {/* Card view for xs/sm */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Grid container spacing={2}>
                    {filteredEmployees.map((employee) => (
                      <Grid item xs={12} key={employee.id}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, bgcolor: 'background.paper' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', mr: 1 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', wordBreak: 'break-word' }}>
                                {employee.firstname} {employee.lastname}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.92rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                {employee.email}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                              label={employee.role}
                              size="small"
                              color={employee.role === 'admin' ? 'error' : employee.role === 'department_head' ? 'primary' : 'success'}
                              sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                            />
                            <Chip
                              label={getDepartmentName(employee)}
                              size="small"
                              color="info"
                              sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                            />
                            <Chip
                              label={employee.status || 'active'}
                              size="small"
                              color={employee.status === 'inactive' ? 'default' : 'success'}
                              sx={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: 2, px: 1, height: 20 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
                            <Tooltip title="View"><span><IconButton color="primary" size="small" onClick={() => handleOpenView(employee)}><ViewIcon /></IconButton></span></Tooltip>
                            <Tooltip title="Edit"><span><IconButton color="secondary" size="small" onClick={() => handleOpenDialog(employee)}><EditIcon /></IconButton></span></Tooltip>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}

          {/* Add/Edit Employee Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              pb: { xs: 1, sm: 2 }
            }}>
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              {selectedEmployee && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
                  Note: Name, email, and role cannot be changed for existing employees
                </Typography>
              )}
            </DialogTitle>
            <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                      disabled={selectedEmployee ? true : false}
                      InputProps={{
                        readOnly: selectedEmployee ? true : false,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                      disabled={selectedEmployee ? true : false}
                      InputProps={{
                        readOnly: selectedEmployee ? true : false,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      disabled={selectedEmployee ? true : false}
                      InputProps={{
                        readOnly: selectedEmployee ? true : false,
                      }}
                    />
                  </Grid>
                  {selectedEmployee && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="User ID"
                        value={selectedEmployee.id}
                        disabled
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        name="role"
                        value={formData.role}
                        label="Role"
                        onChange={handleFormChange}
                        disabled={selectedEmployee ? true : false}
                      >
                        <MenuItem value="employee">Employee</MenuItem>
                        <MenuItem value="supervisor">Supervisor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department ID"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleFormChange}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Button onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                sx={{ minWidth: 100 }}
              >
                {selectedEmployee ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Employee Dialog (read-only) */}
          <Dialog 
            open={viewDialogOpen}
            onClose={handleCloseView}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, pb: { xs: 1, sm: 2 } }}>
              Employee Information
            </DialogTitle>
            <DialogContent sx={{ pt: { xs: 1, sm: 2 } }}>
              {selectedEmployee && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                    <Typography variant="body1">{selectedEmployee.firstname || selectedEmployee.firstName || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                    <Typography variant="body1">{selectedEmployee.lastname || selectedEmployee.lastName || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedEmployee.email || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                    <Typography variant="body1">{selectedEmployee.id || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                    <Typography variant="body1">{selectedEmployee.role || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                    <Typography variant="body1">{getDepartmentName(selectedEmployee)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{selectedEmployee.status || 'active'}</Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Button onClick={handleCloseView}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
      </Box>
    </Box>
  );
};

export default Employees; 