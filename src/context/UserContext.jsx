import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const UserContext = createContext();
export default UserContext;

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage immediately
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return { ...parsedUser, isAuthenticated: true };
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const login = useCallback(async (userData) => {
    // If userData has a .user property, use it; otherwise, use userData directly
    const userObj = userData.user ? userData.user : userData;
    
    const userWithAuth = {
      ...userObj,
      isAuthenticated: true,
    };
    
    setUser(userWithAuth);
    localStorage.setItem('user', JSON.stringify(userWithAuth));
    
    if (userData.token) {
    localStorage.setItem('token', userData.token);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token
      await authAPI.logout();
    } finally {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    try {
      // Update user profile in backend
      const { data } = await authAPI.updateProfile(updates);
      if (data) {
        const updatedUser = { ...user, ...data, isAuthenticated: true };
        setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
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