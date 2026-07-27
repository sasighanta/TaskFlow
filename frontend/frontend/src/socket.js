import { io } from 'socket.io-client';

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
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
