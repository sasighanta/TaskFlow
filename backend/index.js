const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const routes = require('./routes');
const authRoutes = require('./auth');
const workspaceRoutes = require('./workspace.routes');

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io — allow all origins (fix for Render deployment) ─────────────
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  // Important for Render: allow both transports
  transports: ['websocket', 'polling'],
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-board', (boardId) => {
    socket.join(`board:${boardId}`);
    console.log(`Socket ${socket.id} joined board:${boardId}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', workspaceRoutes);
app.use('/api', routes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API is running...'));

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
