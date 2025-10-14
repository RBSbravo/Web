import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, useTheme as useMuiTheme, Snackbar, Alert } from '@mui/material';
import useUser from '../../context/useUser';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import LogoutBackdrop from './LogoutBackdrop';
import LogoutDialog from './LogoutDialog';
import NotificationModal from './NotificationModal';
import LoadingSpinner from './LoadingSpinner';
import { navigationItems, DRAWER_WIDTH } from './constants';
import { notificationAPI } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';

const Layout = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Use refs to prevent unnecessary re-renders
  const logoutTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));

  // Memoized event handlers
  const handleMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogoutClick = useCallback(() => {
    handleClose();
    setLogoutDialogOpen(true);
  }, [handleClose]);

  const handleLogoutConfirm = useCallback(async () => {
    setLogoutDialogOpen(false);
    setLogoutLoading(true);

    // Clear any existing timeouts
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    // Simulate logout process
    logoutTimeoutRef.current = setTimeout(() => {
      setLogoutSuccess(true);
      
      // Clear user data
      logout();
      
      // Show success state briefly before redirect
      successTimeoutRef.current = setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 2000);
  }, [logout, navigate]);

  const handleLogoutCancel = useCallback(() => {
    setLogoutDialogOpen(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setNotificationModalOpen(true);
  }, []);

  const handleNotificationModalClose = useCallback(() => {
    setNotificationModalOpen(false);
    // Refresh unread count when modal closes
    setTimeout(async () => {
      try {
        const res = await notificationAPI.getUnread();
        setUnreadCount(res.data.length);
      } catch (e) {
        setUnreadCount(0);
      }
    }, 300);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if ((isMobile || isTablet) && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [navigate, sidebarOpen, isMobile, isTablet]);

  useEffect(() => {
    // Fetch unread count on mount
    const fetchUnreadCount = async () => {
      try {
        const res = await notificationAPI.getUnread();
        setUnreadCount(res.data.length);
      } catch (e) {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      const token = localStorage.getItem('token');
      connectSocket(token, user.id, (payload) => {
        // Show a toast/snackbar
        setSnackbarMessage(payload.data.message || 'You have a new notification');
        setSnackbarOpen(true);
        // Optionally, increment unread count
        setUnreadCount((prev) => prev + 1);
      });
      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        onSidebarToggle={handleSidebarToggle}
        user={user}
        anchorEl={anchorEl}
        onMenuOpen={handleMenu}
        onMenuClose={handleClose}
        onLogout={handleLogoutClick}
        onNotificationClick={handleNotificationClick}
        onNavigate={handleNavigation}
        unreadCount={unreadCount}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        variant="permanent"
        user={user}
        navigationItems={navigationItems}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />

      {/* Mobile/Tablet Sidebar */}
      <Sidebar
        variant="temporary"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        user={user}
        navigationItems={navigationItems}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          minHeight: 0,
          width: { 
            xs: '100%', 
            sm: isTablet ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
            md: `calc(100% - ${DRAWER_WIDTH}px)`
          },
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ 
          height: { 
            xs: 56, 
            sm: (theme) => theme.mixins.toolbar.minHeight || 64 
          } 
        }} />
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 1.5, sm: 2, md: 3 },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Logout Backdrop */}
      <LogoutBackdrop 
        logoutLoading={logoutLoading}
        logoutSuccess={logoutSuccess}
      />

      {/* Logout Dialog */}
      <LogoutDialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />

      {/* Notification Modal */}
      <NotificationModal
        open={notificationModalOpen}
        onClose={handleNotificationModalClose}
        onUnreadCountChange={setUnreadCount}
      />

      {/* Snackbar for real-time notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
});

Layout.displayName = 'Layout';

export default Layout; 