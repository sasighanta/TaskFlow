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

const cron = require('node-cron');
const pool = require('./db'); // make sure this path matches your db file

// Runs every hour, checks for overdue cards and creates notifications
cron.schedule('0 * * * *', async () => {
  console.log('Running overdue check...');
  try {
    const overdue = await pool.query(`
      SELECT c.id, c.title, c.assigned_to, c.due_date, l.board_id
      FROM cards c
      JOIN lists l ON c.list_id = l.id
      WHERE c.due_date < NOW()
        AND c.status != 'done'
        AND c.assigned_to IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.card_id = c.id
            AND n.type = 'overdue'
            AND n.created_at > NOW() - interval '24 hours'
        )
    `);

    for (const card of overdue.rows) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message, card_id)
         VALUES ($1, 'overdue', $2, $3)`,
        [card.assigned_to, `Card "${card.title}" is overdue`, card.id]
      );
    }
    console.log(`Created ${overdue.rows.length} overdue notifications`);
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
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

const attachmentsRoutes = require('./attachments.routes');
app.use('/api', attachmentsRoutes);

module.exports = { io };
