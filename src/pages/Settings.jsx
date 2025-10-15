import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Avatar,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  ViewKanban as ViewKanbanIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon2,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileUpload as FileUploadIcon,
  Comment as CommentIcon,
  Forward as ForwardIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import PageHeader from '../components/layout/PageHeader';
import RateLimitAlert from '../components/RateLimitAlert';
import { authAPI, userAPI } from '../services/api';
import passwordValidator from '../utils/passwordValidator';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { handleApiError, rateLimitHandler } from '../utils/rateLimitHandler';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          py: 4, 
          px: 1,
          minHeight: '400px',
          width: '100%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || ''
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRateLimitData, setPasswordRateLimitData] = useState(null);

  // Removed global save; actions are handled inline

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAccountFieldChange = (field, value) => {
    setAccountForm(prev => ({ ...prev, [field]: value }));
    if (accountError) setAccountError('');
  };

  const handleAccountEditToggle = () => {
    setIsEditingAccount(true);
  };

  const handleAccountCancel = () => {
    setAccountForm({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || ''
    });
    setIsEditingAccount(false);
    setAccountError('');
  };

  const handleAccountSave = async () => {
    setIsSavingAccount(true);
    setAccountError('');
    try {
      const payload = {
        firstname: (accountForm.firstname || '').trim(),
        lastname: (accountForm.lastname || '').trim(),
        email: (accountForm.email || '').trim()
      };
      await userAPI.update(user.id, payload);
      const updatedUser = { ...user, ...payload };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingAccount(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (e) {
      setAccountError(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
      ...prev,
        [field]: ''
      }));
    }
    
    // Clear success message when user starts typing
    if (passwordSuccess) {
      setPasswordSuccess(false);
    }
    
    // Clear general error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = passwordValidator.validate(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errors[0];
      }
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    // Check if we can retry (not rate limited)
    if (!rateLimitHandler.canRetry('changePassword')) {
      const remainingTime = rateLimitHandler.getRemainingRetryTime('changePassword');
      setPasswordError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordRateLimitData(null);
    
    try {
      // Use the real API call
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
      rateLimitHandler.clearRetryTimer('changePassword');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
      
      // Clear success message and logout after 3 seconds
      setTimeout(async () => {
        setPasswordSuccess(false);
        
        // Logout using the API and clear local storage
        try {
          await authAPI.logout();
        } catch (logoutError) {
          console.warn('Logout API call failed, but continuing with local cleanup');
        }
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      const errorInfo = handleApiError(error);
      
      if (errorInfo.type === 'rate_limit') {
        setPasswordRateLimitData(error.rateLimitData || { error: error.message });
        rateLimitHandler.setRetryTimer('changePassword', errorInfo.retryTime);
        setPasswordError(errorInfo.message);
      } else {
        // Map backend errors to user-friendly messages
        let errorMessage = errorInfo.message;
        
        if (errorMessage.toLowerCase().includes('incorrect')) {
          errorMessage = 'Your current password is incorrect.';
        } else if (errorMessage.toLowerCase().includes('at least 6 characters')) {
          errorMessage = 'New password must be at least 6 characters.';
        } else if (errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'User not found. Please re-login.';
        } else if (errorMessage.toLowerCase().includes('required')) {
          errorMessage = 'Please fill in all password fields.';
        } else if (errorMessage.toLowerCase().includes('server error')) {
          errorMessage = 'A server error occurred. Please try again later.';
        } else if (errorMessage.toLowerCase().includes('same as current')) {
          errorMessage = 'New password must be different from the current password.';
        }
        
        setPasswordError(errorMessage);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      pt: { xs: 7, sm: 3, md: 4 }, 
      px: { xs: 1, sm: 2, md: 3 }, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      height: 'auto',
      overflowY: 'auto'
    }}>
      <PageHeader 
        title="Settings"
        subtitle="Customize your application preferences"
        emoji="⚙️"
        color="warning"
      />

      {showSaveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Card sx={{ minHeight: '500px' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
                  sx={{
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px',
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: 'primary.main',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                }
              }}
            >
              <Tab icon={<PersonIcon />} label="Account" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<HelpIcon />} label="User Guide" />
            </Tabs>
          </Box>

          {/* Account Settings */}
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
              <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Avatar
                sx={{
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                      mr: 3,
                      fontWeight: 'bold'
                    }}
                  >
                    {user.firstname?.[0]?.toUpperCase()}{user.lastname?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {user.firstname} {user.lastname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {user.role}
                          </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 4 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Account Information
                  </Typography>
                  {!isEditingAccount ? (
                    <Button variant="outlined" onClick={handleAccountEditToggle} startIcon={<EditIcon />}>Edit</Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={handleAccountCancel} startIcon={<CloseIcon />}>Cancel</Button>
                      <Button variant="contained" onClick={handleAccountSave} disabled={isSavingAccount} startIcon={<SaveIcon />}>
                        {isSavingAccount ? 'Saving...' : 'Save'}
                      </Button>
                    </Box>
                  )}
                </Box>
                {accountError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{accountError}</Alert>
                )}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={isEditingAccount ? accountForm.firstname : (user.firstname || '')}
                      onChange={(e) => handleAccountFieldChange('firstname', e.target.value)}
                      disabled={!isEditingAccount}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={isEditingAccount ? accountForm.lastname : (user.lastname || '')}
                      onChange={(e) => handleAccountFieldChange('lastname', e.target.value)}
                      disabled={!isEditingAccount}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={isEditingAccount ? accountForm.email : (user.email || '')}
                      onChange={(e) => handleAccountFieldChange('email', e.target.value)}
                      disabled={!isEditingAccount}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user.role || ''}
                      disabled
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={user.department?.name || user.department || 'N/A'}
                      disabled
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
                  </Box>
          </TabPanel>

          {/* Security Settings */}
          <TabPanel value={currentTab} index={1}>
            <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
              <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                          </Typography>
                
                {passwordSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Password changed successfully! You will be logged out for security.
                  </Alert>
                )}

                <RateLimitAlert
                  isOpen={!!passwordRateLimitData}
                  onClose={() => setPasswordRateLimitData(null)}
                  rateLimitData={passwordRateLimitData}
                  endpoint="changePassword"
                  onRetry={() => {
                    setPasswordRateLimitData(null);
                    setPasswordError('');
                  }}
                />
                
                {passwordError && !passwordRateLimitData && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {passwordError}
                  </Alert>
                )}
                
                <TextField
                  fullWidth
                  type={showPasswords.current ? 'text' : 'password'}
                  label="Current Password"
                  variant="outlined"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('current')}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  type={showPasswords.new ? 'text' : 'password'}
                  label="New Password"
                  variant="outlined"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('new')}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <PasswordStrengthIndicator password={passwordData.newPassword} />
                
                <TextField
                  fullWidth
                  type={showPasswords.confirm ? 'text' : 'password'}
                  label="Confirm New Password"
                  variant="outlined"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirm')}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  startIcon={isChangingPassword ? <CircularProgress size={20} /> : <SecurityIcon />}
                >
                  {isChangingPassword ? 'Changing Password...' : 'Update Password'}
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  After changing your password, you will be automatically logged out for security purposes.
                          </Typography>
              </Grid>
            </Grid>
                        </Box>
          </TabPanel>

          {/* User Guide */}
          <TabPanel value={currentTab} index={2}>
            <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                📚 Comprehensive User Guide
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
                Welcome to the Ticketing and Task Management System! This guide will help you navigate and utilize all the features effectively.
              </Typography>

              {/* Navigation Overview */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MenuIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Navigation & Layout
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Sidebar Navigation
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Dashboard</strong> - Overview of your tasks, tickets, and performance metrics
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Tasks</strong> - Create, manage, and track your assigned tasks
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Tickets</strong> - Submit, view, and manage support tickets
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Kanban Board</strong> - Visual task management with drag-and-drop
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Analytics</strong> - Performance insights and reports
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Reports</strong> - Generate detailed reports
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Employees</strong> - Manage team members (Admin/Department Head only)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Settings</strong> - Account settings and user guide
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Header Features
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Menu Button</strong> - Toggle sidebar on mobile/tablet
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Department Badge</strong> - Shows your current department
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Theme Toggle</strong> - Switch between light/dark mode
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Notifications</strong> - View system notifications
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Profile Menu</strong> - Access account settings and logout
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Dashboard Guide */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Dashboard Overview
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    The dashboard provides a comprehensive overview of your work status and performance metrics.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Key Metrics Cards
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Total Tickets</strong> - All Department tickets received.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Open Tickets</strong> - Currently active tickets
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Closed Tickets</strong> - Completed tickets
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Overdue Tickets</strong> - Tickets past due date
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Total Tasks</strong> - All Department tasks
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Completed Tasks</strong> - Finished tasks
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Overdue Tasks</strong> - Tasks past due date
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Active Users</strong> - Currently online users
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Recent Activity
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Recent Tickets</strong> - Latest ticket updates
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Recent Tasks</strong> - Latest task activities
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Team Performance</strong> - Department efficiency metrics
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Performance Rating</strong> - Your efficiency score
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tasks Management */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Tasks Management
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Create, assign, and track tasks efficiently with our comprehensive task management system.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Creating Tasks
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          1. Click the <strong>"New Task"</strong> button
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          2. Fill in task details (title, description, priority)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          3. Assign to team members
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          4. Set due date and status
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          5. Upload relevant files (optional)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          6. Click <strong>"Create Task"</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Task Management
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>View</strong> - Click eye icon to see full details
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Edit</strong> - Click edit icon to modify task
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Delete</strong> - Click delete icon to remove task
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Status Updates</strong> - Change status from dropdown
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Priority Changes</strong> - Update priority level
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Comments</strong> - Add progress updates
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
                    Task Statuses
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                        <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tickets Management */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ConfirmationNumberIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Tickets Management
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Submit, track, and manage support tickets with comprehensive workflow management.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Creating Tickets
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          1. Click <strong>"New Ticket"</strong> button
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          2. Enter ticket title and description
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          3. Select priority level (Low, Medium, High)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          4. Choose target department
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          5. Set due date
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          6. Upload supporting files
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          7. Click <strong>"Create Ticket"</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Ticket Operations
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>View</strong> - See full ticket details
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Edit</strong> - Modify ticket information
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Forward</strong> - Send to another department
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Comments</strong> - Add updates and remarks
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>File Management</strong> - Upload/download files
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Status Tracking</strong> - Monitor progress
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
                    Ticket Priorities
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                        <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Low
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Medium
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                        <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          High
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
                    Ticket Statuses
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                        <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                        <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Declined
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* File Management */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FileUploadIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      File Management
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Upload, manage, and organize files for tasks and tickets efficiently.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Supported File Types
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>PDF Documents</strong> - PDF files only
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Images</strong> - JPG, PNG, GIF, WEBP, BMP
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        File Operations
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Upload</strong> - Drag & drop or click to upload
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Download</strong> - Click download icon
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Delete</strong> - Remove unwanted files
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Preview</strong> - View files in browser
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Size Limit</strong> - Max 10MB per file
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>File Restrictions</strong> - Only PDF and image files accepted
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> Only PDF and image files are accepted for uploads. When uploading or deleting files during task/ticket editing, you must provide remarks explaining the changes. The cancel button will be disabled until you complete the update with remarks.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>

              {/* Comments & Communication */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CommentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Comments & Communication
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Keep track of progress and communicate effectively with your team through comments and updates.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Adding Comments
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          1. Open task or ticket details
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          2. Scroll to comments section
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          3. Type your comment
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          4. Click <strong>"Add Comment"</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          5. Comments appear in chronological order
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Comment Types
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Regular Comments</strong> - General updates
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Status Updates</strong> - Progress changes
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Remarks</strong> - Required for file operations
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>System Updates</strong> - Automatic notifications
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> Remarks comments (system-generated updates) cannot be deleted. Only regular comments can be removed by their authors.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>

              {/* Responsive Design */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Responsive Design Features
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    The application is fully responsive and optimized for all device types.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Mobile View
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Collapsible sidebar
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Card-based layouts
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Touch-friendly buttons
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Optimized typography
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Tablet View
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Collapsible sidebar
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Card-based layouts
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Full-width content
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Enhanced touch targets
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Desktop View
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Permanent sidebar
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Table-based layouts
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Full feature access
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Keyboard shortcuts
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Tips & Best Practices */}
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StarIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Tips & Best Practices
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        General Tips
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Use descriptive titles for tasks and tickets
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Set realistic due dates
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Update status regularly
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Add meaningful comments
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Use appropriate priority levels
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Upload relevant supporting files
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Security Best Practices
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Use strong passwords
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Log out when finished
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Don't share login credentials
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Report suspicious activity
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Keep personal info updated
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • Use secure networks
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Support Information */}
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Need Help?
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    If you need additional assistance or have questions not covered in this guide, please contact your system administrator or IT support team.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Common Issues
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Login Problems</strong> - Check credentials or reset password
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>File Upload Issues</strong> - Check file size and format (PDF/images only)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Performance Issues</strong> - Clear browser cache
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Display Problems</strong> - Try refreshing the page
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        Contact Information
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>IT Support</strong> - For technical issues
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>Department Head</strong> - For workflow questions
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>System Admin</strong> - For account issues
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          • <strong>User Guide</strong> - This comprehensive guide
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Thank you for using the Ticketing and Task Management System!</strong> This guide is regularly updated to reflect new features and improvements.
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
                </CardContent>
              </Card>

      {/* Global Save button removed: actions are handled inline for better UX */}
    </Box>
  );
};

export default Settings; 