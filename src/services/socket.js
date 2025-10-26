import { io } from 'socket.io-client';

let socket;

// Helper function to get token from storage (same logic as UserContext and API interceptor)
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const connectSocket = (token, userId, onNotification) => {
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  // Use environment variable if available, fallback to hardcoded URL
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://backend-ticketing-system.up.railway.app';
  
  if (!token) {
    console.error('No token provided to socket connection!');
    return null;
  }
  
  socket = io(SOCKET_URL, {
    auth: { token }
  });

  socket.on('connect', () => {
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('notification', (payload) => {
    if (onNotification) onNotification(payload);
  });

  socket.on('disconnect', () => {
    // Socket disconnected
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
    console.error('Error details:', {
      message: err.message,
      description: err.description,
      context: err.context,
      type: err.type
    });
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

// Convenience function to connect with automatic token retrieval
export const connectSocketWithAuth = (userId, onNotification) => {
  const token = getToken();
  if (!token) {
    console.error('No authentication token found. Please log in again.');
    return null;
  }
  return connectSocket(token, userId, onNotification);
}; 