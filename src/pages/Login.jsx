import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  Alert,
  Fade,
  Slide,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import mitoLogo from '../assets/mito_logo.png';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import RateLimitAlert from '../components/RateLimitAlert';
import useUser from '../context/useUser';
import { authAPI } from '../services/api';
import { handleApiError, rateLimitHandler } from '../utils/rateLimitHandler';

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, user } = useUser();
  // Use simple state for tab, no localStorage persistence
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register

  // Login state
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginRateLimitData, setLoginRateLimitData] = useState(null);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });

  // Register state
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerRateLimitData, setRegisterRateLimitData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [registerFormData, setRegisterFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    role: 'department_head',
  });

  // Add state for forgot password modal
  const [forgotPwOpen, setForgotPwOpen] = useState(false);
  const [forgotPwEmail, setForgotPwEmail] = useState('');
  const [forgotPwLoading, setForgotPwLoading] = useState(false);
  const [forgotPwError, setForgotPwError] = useState('');
  const [forgotPwSuccess, setForgotPwSuccess] = useState('');

  useEffect(() => {
    if (user && user.isAuthenticated) {
      localStorage.removeItem('loginTab');
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setLoginLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch departments for registration
  useEffect(() => {
    if (tab === 1 && departments.length === 0) {
      const fetchDepartments = async () => {
        try {
          const response = await authAPI.getDepartments();
          setDepartments(response.data);
        } catch (error) {
          // ignore
        }
      };
      fetchDepartments();
    }
  }, [tab, departments.length]);

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginFormData.email || !loginFormData.password) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    // Check if we can retry (not rate limited)
    if (!rateLimitHandler.canRetry('login')) {
      const remainingTime = rateLimitHandler.getRemainingRetryTime('login');
      setLoginError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess(false);
    setLoginRateLimitData(null);
    
    // Safety timeout to ensure loading state is reset
    const loadingTimeout = setTimeout(() => {
      setLoginLoading(false);
    }, 30000); // 30 seconds timeout
    
    try {
      const response = await authAPI.login(loginFormData);
      const { data } = response;
      
      if (data && data.token) {
        clearTimeout(loadingTimeout);
        setLoginSuccess(true);
        rateLimitHandler.clearRetryTimer('login');
        const userData = {
          user: data.user,
          token: data.token
        };
        login(userData);
        setTimeout(() => { navigate('/app/dashboard'); }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.log('Error response:', err.response);
      console.log('Error data:', err.response?.data);
      
      // Always stop loading first and clear timeout
      clearTimeout(loadingTimeout);
      setLoginLoading(false);
      
      try {
        const errorInfo = handleApiError(err);
        console.log('Error info from handleApiError:', errorInfo);
        
        if (errorInfo.type === 'rate_limit') {
          // Use the rate limit data from errorInfo (like desktop app)
          setLoginRateLimitData(errorInfo.rateLimitData);
          rateLimitHandler.setRetryTimer('login', errorInfo.retryTime || 15 * 60 * 1000);
          setLoginError(''); // Clear regular error when showing rate limit alert
        } else {
          setLoginError(errorInfo.message);
          setLoginRateLimitData(null); // Clear rate limit data for regular errors
        }
      } catch (errorHandlingErr) {
        console.error('Error handling failed:', errorHandlingErr);
        // Fallback error handling (like desktop app)
        setLoginError('An error occurred. Please try again later.');
        setLoginRateLimitData(null);
      }
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
    if (registerError) setRegisterError('');
  };

  const validateRegisterForm = () => {
    if (!registerFormData.firstname || !registerFormData.lastname || !registerFormData.email || !registerFormData.password || !registerFormData.confirmPassword || !registerFormData.departmentId) {
      setRegisterError('Please fill in all fields');
      return false;
    }
    if (registerFormData.password !== registerFormData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return false;
    }
    if (registerFormData.password.length < 8) {
      setRegisterError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    
    // Check if we can retry (not rate limited)
    if (!rateLimitHandler.canRetry('register')) {
      const remainingTime = rateLimitHandler.getRemainingRetryTime('register');
      setRegisterError(`Please wait ${Math.ceil(remainingTime / 1000)} seconds before trying again.`);
      return;
    }
    
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess(false);
    setRegisterRateLimitData(null);
    
    // Safety timeout to ensure loading state is reset
    const loadingTimeout = setTimeout(() => {
      setRegisterLoading(false);
    }, 30000); // 30 seconds timeout
    
    try {
      const registrationData = { ...registerFormData };
      delete registrationData.confirmPassword;
      const response = await authAPI.register(registrationData);
      if (response.data) {
        clearTimeout(loadingTimeout);
        setRegisterSuccess(true);
        rateLimitHandler.clearRetryTimer('register');
        
        // Clear all form fields
        setRegisterFormData({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          confirmPassword: '',
          departmentId: '',
          role: 'department_head',
        });
        
        // Add delay before switching to login tab
        setTimeout(() => {
          setTab(0); // Switch to login tab
          setRegisterSuccess(false);
          setRegisterError('');
        }, 2000); // 2 second delay
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.log('Registration error response:', err.response);
      console.log('Registration error data:', err.response?.data);
      
      // Always stop loading first and clear timeout
      clearTimeout(loadingTimeout);
      setRegisterLoading(false);
      
      try {
        const errorInfo = handleApiError(err);
        console.log('Registration error info from handleApiError:', errorInfo);
        
        if (errorInfo.type === 'rate_limit') {
          // Use the rate limit data from errorInfo (like desktop app)
          setRegisterRateLimitData(errorInfo.rateLimitData);
          rateLimitHandler.setRetryTimer('register', errorInfo.retryTime || 15 * 60 * 1000);
          setRegisterError(''); // Clear regular error when showing rate limit alert
        } else {
          setRegisterError(errorInfo.message);
          setRegisterRateLimitData(null); // Clear rate limit data for regular errors
        }
      } catch (errorHandlingErr) {
        console.error('Registration error handling failed:', errorHandlingErr);
        // Fallback error handling (like desktop app)
        setRegisterError('An error occurred. Please try again later.');
        setRegisterRateLimitData(null);
      }
    }
  };

  const handleTabChange = (_, v) => {
    setTab(v);
    setLoginError('');
    setRegisterError('');
  };

  if (loginLoading && !loginError) return <LoadingSpinner overlay message="Loading login..." />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.mode === 'dark' 
          ? theme.palette.background.default
          : `linear-gradient(to right bottom, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
        py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={theme.palette.mode === 'dark' ? 2 : 8}
            sx={{
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.paper 
                : theme.palette.common.white,
              borderRadius: 3,
              position: 'relative',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            {/* Logo */}
            <Fade in={true} timeout={1200}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  component="img"
                  src={mitoLogo}
                  alt="Mito Logo"
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Fade>

            {/* Tabs for Login/Register */}
            <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }} centered>
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>

             {/* Welcome message */}
             {tab === 0 && (
               <Box sx={{ textAlign: 'center', mb: 2 }}>
                 <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', fontSize: 24, mt: 0.75 }}>
                   Welcome Back
                 </Typography>
                 <Typography variant="body1" color="text.secondary" sx={{ fontSize: 14, mt: 0.25 }}>
                   Sign in to continue
                 </Typography>
               </Box>
             )}

            {/* Login Form */}
            {tab === 0 && (
              <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                  value={loginFormData.email}
                  onChange={handleLoginChange}
                  disabled={loginLoading || loginSuccess}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                  autoComplete="current-password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  disabled={loginLoading || loginSuccess}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          disabled={loginLoading || loginSuccess}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                  <Link 
                    component="button"
                    type="button"
                    variant="body2" 
                    underline="hover"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setForgotPwOpen(true);
                    }}
                    sx={{ 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        color: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
                
                <RateLimitAlert
                  isOpen={!!loginRateLimitData}
                  onClose={() => setLoginRateLimitData(null)}
                  rateLimitData={loginRateLimitData}
                  endpoint="login"
                  onRetry={() => {
                    setLoginRateLimitData(null);
                    setLoginError('');
                  }}
                />
                
                {loginError && !loginRateLimitData && (
                  <Fade in={true}>
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }} icon={<ErrorIcon />}>
                      {loginError}
                    </Alert>
                  </Fade>
                )}
                {loginSuccess && (
                  <Fade in={true}>
                    <Alert severity="success" sx={{ width: '100%', mb: 2 }} icon={<CheckCircleIcon />}>
                      Login successful! Redirecting...
                    </Alert>
                  </Fade>
                )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                  disabled={loginLoading || loginSuccess}
                >
                  {loginLoading ? (
                    <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
              </form>
            )}

            {/* Register Form */}
            {tab === 1 && (
              <form onSubmit={handleRegisterSubmit} style={{ width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="firstname"
                      label="First Name"
                      name="firstname"
                      autoComplete="given-name"
                      value={registerFormData.firstname}
                      onChange={handleRegisterChange}
                      disabled={registerLoading || registerSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastname"
                      label="Last Name"
                      name="lastname"
                      autoComplete="family-name"
                      value={registerFormData.lastname}
                      onChange={handleRegisterChange}
                      disabled={registerLoading || registerSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={registerFormData.email}
                      onChange={handleRegisterChange}
                      disabled={registerLoading || registerSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel id="department-label">Department</InputLabel>
                      <Select
                        labelId="department-label"
                        id="departmentId"
                        name="departmentId"
                        value={registerFormData.departmentId}
                        label="Department"
                        onChange={handleRegisterChange}
                        disabled={registerLoading || registerSuccess}
                        startAdornment={
                          <InputAdornment position="start">
                            <BusinessIcon color="action" />
                          </InputAdornment>
                        }
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={registerShowPassword ? 'text' : 'password'}
                      id="register-password"
                      autoComplete="new-password"
                      value={registerFormData.password}
                      onChange={handleRegisterChange}
                      disabled={registerLoading || registerSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setRegisterShowPassword(!registerShowPassword)}
                              edge="end"
                              disabled={registerLoading || registerSuccess}
                            >
                              {registerShowPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <PasswordStrengthIndicator password={registerFormData.password} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={registerShowPassword ? 'text' : 'password'}
                      id="register-confirm-password"
                      autoComplete="new-password"
                      value={registerFormData.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={registerLoading || registerSuccess}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setRegisterShowPassword(!registerShowPassword)}
                              edge="end"
                              disabled={registerLoading || registerSuccess}
                            >
                              {registerShowPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                
                <RateLimitAlert
                  isOpen={!!registerRateLimitData}
                  onClose={() => setRegisterRateLimitData(null)}
                  rateLimitData={registerRateLimitData}
                  endpoint="register"
                  onRetry={() => {
                    setRegisterRateLimitData(null);
                    setRegisterError('');
                  }}
                />
                
                {registerError && !registerRateLimitData && (
                  <Fade in={true}>
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }} icon={<ErrorIcon />}>
                      {registerError}
                    </Alert>
                  </Fade>
                )}
                {registerSuccess && (
                  <Fade in={true}>
                    <Alert severity="success" sx={{ width: '100%', mt: 2 }} icon={<CheckCircleIcon />}>
                      Registration successful! You will be redirected to login in a few seconds...
                    </Alert>
                  </Fade>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.2 }}
                  disabled={registerLoading || registerSuccess}
                >
                  {registerLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Register'
                  )}
                </Button>
              </form>
            )}
          </Paper>
        </Slide>
      </Container>
      <Dialog 
        open={forgotPwOpen} 
        onClose={() => setForgotPwOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          Forgot Password
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            margin="normal"
            value={forgotPwEmail}
            onChange={e => setForgotPwEmail(e.target.value)}
            disabled={forgotPwLoading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          {forgotPwError && (
            <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
              {forgotPwError}
            </Alert>
          )}
          {forgotPwSuccess && (
            <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
              {forgotPwSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setForgotPwOpen(false)} 
            disabled={forgotPwLoading}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setForgotPwError('');
              setForgotPwSuccess('');
              if (!forgotPwEmail) {
                setForgotPwError('Please enter your email address.');
                return;
              }
              setForgotPwLoading(true);
              try {
                await authAPI.forgotPassword({ email: forgotPwEmail });
                setForgotPwSuccess('If an account with that email exists, a reset link has been sent.');
              } catch (err) {
                setForgotPwError(err.response?.data?.error || 'Failed to send reset email.');
              } finally {
                setForgotPwLoading(false);
              }
            }}
            variant="contained"
            color="primary"
            disabled={forgotPwLoading}
            size="small"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
              minWidth: '120px',
              height: '36px'
            }}
          >
            {forgotPwLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 