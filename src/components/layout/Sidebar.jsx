import React, { memo, useMemo, useCallback } from 'react';
import {
  Drawer,
  Toolbar,
  Box,
  List,
  Avatar,
  Typography,
  Chip,
  useTheme as useMuiTheme,
} from '@mui/material';
import NavigationItem from './NavigationItem';

const drawerWidth = 280;
const mobileDrawerWidth = 260;

const Sidebar = memo(({ 
  variant = 'permanent', 
  open = true, 
  onClose, 
  user, 
  navigationItems, 
  currentPath, 
  onNavigate 
}) => {
  const muiTheme = useMuiTheme();

  // Memoize navigation handler to avoid inline arrow functions
  const handleItemNavigate = useCallback((path) => {
    onNavigate(path);
  }, [onNavigate]);

  const userData = useMemo(() => {
    if (!user) return null;
    const userName = user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : (user?.name || 'User');
    const userEmail = user?.email || 'user@example.com';
    const userDepartment = user?.department || 'Department';
    return { userName, userEmail, userDepartment };
  }, [user]);

  if (!userData) return null;

  const { userName, userEmail, userDepartment } = userData;

  const isMobileDrawer = variant === 'temporary';

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: isMobileDrawer ? mobileDrawerWidth : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isMobileDrawer ? mobileDrawerWidth : drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
          backgroundColor: muiTheme.palette.mode === 'dark' ? muiTheme.palette.background.paper : muiTheme.palette.common.white,
        },
        display: isMobileDrawer ? { xs: 'block', sm: 'none' } : { xs: 'none', sm: 'block' },
      }}
    >
      <Toolbar />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 64px)', // Full height minus toolbar
        overflow: 'hidden' // Prevent scrolling
      }}>
        {/* User Info */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          textAlign: 'center', 
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          background: muiTheme.palette.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexShrink: 0 // Prevent shrinking
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              letterSpacing: 0.2
            }}
          >
            {userName}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              wordBreak: 'break-all'
            }}
          >
            {userEmail}
          </Typography>
          <Chip
            label={userDepartment}
            color="primary"
            size="small"
            variant="outlined"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, borderRadius: 2, fontWeight: 500 }}
          />
        </Box>

        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1,
          minHeight: 0 // Allow flex shrinking
        }}>
          <List sx={{ 
            pt: 2, 
            pb: 1, 
            flexGrow: 1,
            overflow: 'hidden' // Prevent scrolling
          }}>
            {navigationItems.slice(0, -1).map((item) => (
              <NavigationItem 
                key={item.text} 
                item={item} 
                isSelected={currentPath === item.path} 
                onNavigate={() => handleItemNavigate(item.path)} 
              />
            ))}
          </List>
          
          {/* Settings at bottom */}
          <Box sx={{ 
            borderTop: `1px solid ${muiTheme.palette.divider}`,
            pt: 1,
            pb: 2,
            flexShrink: 0 // Prevent shrinking
          }}>
            <List sx={{ py: 0 }}>
              {navigationItems.slice(-1).map((item) => (
                <NavigationItem 
                  key={item.text} 
                  item={item} 
                  isSelected={currentPath === item.path} 
                  onNavigate={() => handleItemNavigate(item.path)} 
                />
              ))}
            </List>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 