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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import PageHeader from '../components/layout/PageHeader';
import { authAPI, userAPI } from '../services/api';
import passwordValidator from '../utils/passwordValidator';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

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
    if (!validatePasswords()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordError('');
    
    try {
      // Use the real API call
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
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
      // Map backend errors to user-friendly messages
      let errorMessage = error.response?.data?.error || error.message || 'Failed to change password';
      
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
                
                {passwordError && (
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
                </CardContent>
              </Card>

      {/* Global Save button removed: actions are handled inline for better UX */}
    </Box>
  );
};

export default Settings; 