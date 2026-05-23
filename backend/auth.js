const express = require('express');
const router = express.Router();
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || "trello_secret_key";

/* ✅ REGISTER */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if email already exists
    const existing = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users(username, email, password) VALUES($1,$2,$3) RETURNING id, username, email',
      [username, email, hashed]
    );

    const user = result.rows[0];

    // Create a default board for the user
    const board = await pool.query(
      'INSERT INTO boards(title, user_id) VALUES($1,$2) RETURNING *',
      ['My Board', user.id]
    );

    // Create default lists
    await pool.query(
      'INSERT INTO lists(title, board_id, position) VALUES($1,$2,$3),($4,$5,$6),($7,$8,$9)',
      ['To Do', board.rows[0].id, 1, 'In Progress', board.rows[0].id, 2, 'Done', board.rows[0].id, 3]
    );

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ✅ LOGIN */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ✅ GET ME (verify token) */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    const result = await pool.query('SELECT id, username, email FROM users WHERE id=$1', [decoded.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;