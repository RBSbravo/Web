import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token, userId, onNotification) => {
  const SOCKET_URL = 'https://backend-ticketing-system.up.railway.app';
  
  console.log('Connecting to socket:', SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('notification', (payload) => {
    console.log('New notification:', payload);
    if (onNotification) onNotification(payload);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
}; 