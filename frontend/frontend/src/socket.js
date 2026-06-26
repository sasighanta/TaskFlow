// socket.js
// frontend/src/socket.js

import { io } from 'socket.io-client';

// Same URL as your API in App.jsx — no /api at the end, just the base URL
const socket = io('https://trello-backend-i0lq.onrender.com', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'], // try websocket first, fall back to polling
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

export default socket;
