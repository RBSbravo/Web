import React, { createContext, useState, useMemo, useCallback } from 'react';
import { authAPI } from '../services/api';

const UserContext = createContext();
export default UserContext;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Robust detection of which storage holds the auth info.
    // Prefer explicit 'auth_storage' flag; fall back to checking tokens directly.
    const explicitStorage = localStorage.getItem('auth_storage') || sessionStorage.getItem('auth_storage');
    let storage;

    if (explicitStorage === 'local') {
      storage = localStorage;
    } else if (explicitStorage === 'session') {
      storage = sessionStorage;
    } else {
      // No explicit flag: prefer localStorage if it has a token/user, otherwise sessionStorage
      if (localStorage.getItem('token') || localStorage.getItem('user')) {
        storage = localStorage;
      } else if (sessionStorage.getItem('token') || sessionStorage.getItem('user')) {
        storage = sessionStorage;
      } else {
        storage = localStorage; // default
      }
    }

    const storedUser = storage.getItem('user');
    const token = storage.getItem('token');

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return { ...parsedUser, isAuthenticated: true };
      } catch (error) {
        storage.removeItem('user');
        storage.removeItem('token');
        storage.removeItem('auth_storage');
        return null;
      }
    }

    return null;
  });

  const login = useCallback(async (userData, rememberMe = false) => {
    // If userData has a .user property, use it; otherwise, use userData directly
    const userObj = userData.user ? userData.user : userData;
    
    const userWithAuth = {
      ...userObj,
      isAuthenticated: true,
    };
    
    setUser(userWithAuth);
    
    // Use appropriate storage based on remember me choice
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userWithAuth));
    storage.setItem('auth_storage', rememberMe ? 'local' : 'session');
    
    if (userData.token) {
      storage.setItem('token', userData.token);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token
      await authAPI.logout();
    } finally {
      // Clear both storage types and state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_storage');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('auth_storage');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    // Update user profile in backend
    const { data } = await authAPI.updateProfile(updates);
    if (data) {
      const updatedUser = { ...user, ...data, isAuthenticated: true };
      setUser(updatedUser);
      
      // Update the storage that was used for login
      const authStorage = localStorage.getItem('auth_storage');
      const storage = authStorage === 'local' ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const isAuthenticated = useCallback(() => {
    return user && user.isAuthenticated;
  }, [user]);

  const hasRole = useCallback((role) => {
    return user && user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  const isDepartmentHead = useCallback(() => {
    return hasRole('department_head');
  }, [hasRole]);

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  const isEmployee = useCallback(() => {
    return hasRole('employee');
  }, [hasRole]);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isDepartmentHead,
    isAdmin,
    isEmployee,
  }), [user, login, logout, updateUser, isAuthenticated, hasRole, hasAnyRole, isDepartmentHead, isAdmin, isEmployee]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 