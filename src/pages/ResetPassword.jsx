import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Fade,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Error as ErrorIcon,
  Security,
  LockReset
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import passwordValidator from '../utils/passwordValidator';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPw, setShowPw] = useState({ new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isResetComplete, setIsResetComplete] = useState(false);

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Alert severity="error">Invalid or missing reset token.</Alert>
        </Paper>
      </Container>
    );
  }

  const validatePasswords = () => {
    const errors = {};
    
    // Validate new password
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = passwordValidator.validate(newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errors[0];
      }
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (field, value) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }
    
    // Clear errors when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    if (!validatePasswords()) {
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: newPassword });
      setSuccess('Password reset successful! You can now log in with your new password.');
      setIsResetComplete(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Success state - show comprehensive success message
  if (isResetComplete && success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Container maxWidth="sm">
          <Fade in={true} timeout={800}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', overflow: 'visible' }}>
              <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                  Password Reset Successful!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  Your password has been successfully updated. You can now log in with your new password.
                </Typography>
                <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>What's next?</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Your password has been securely updated<br/>
                    • You can now log in with your new password<br/>
                    • The reset link is no longer valid for security
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2, py: 1.5 }}
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper sx={{ p: { xs: 3, sm: 6 }, borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <LockReset sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Reset Your Password
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Create a strong password to secure your account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                label="New Password"
                type={showPw.new ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={e => handlePasswordChange('newPassword', e.target.value)}
                disabled={loading || isResetComplete}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                        edge="end"
                        disabled={loading || isResetComplete}
                      >
                        {showPw.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Password Strength Indicator */}
              {newPassword && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <PasswordStrengthIndicator 
                    password={newPassword} 
                    showSuggestions={true}
                    defaultExpanded={false}
                  />
                </Box>
              )}

              <TextField
                label="Confirm New Password"
                type={showPw.confirm ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                disabled={loading || isResetComplete}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                        edge="end"
                        disabled={loading || isResetComplete}
                      >
                        {showPw.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Error Message */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 2 }}
                  icon={<ErrorIcon />}
                >
                  {error}
                </Alert>
              )}

              {/* Success Message */}
              {success && !isResetComplete && (
                <Alert 
                  severity="success" 
                  sx={{ mt: 2 }}
                  icon={<CheckCircle />}
                >
                  {success}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, py: 1.5 }}
                disabled={loading || isResetComplete || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="body2">Resetting Password...</Typography>
                  </Box>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Remember your password?
              </Typography>
              <Button
                variant="text"
                color="primary"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPassword; 