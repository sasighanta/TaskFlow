// ============================================
// workspace.routes.js
// Add this as a new file in your backend/
// Then in index.js: app.use('/api', require('./workspace.routes'))
// ============================================

const express = require('express');
const router = express.Router();
const db = require('./db');

// ── Auth middleware (you already have this, reuse it) ──────────────────────
// This assumes your existing JWT middleware sets req.userId
// If yours sets req.user.id, adjust accordingly

// ── Role hierarchy helper ──────────────────────────────────────────────────
const ROLE_RANK = { admin: 3, manager: 2, member: 1 };

async function requireWorkspaceRole(req, res, next, minRole = 'member') {
  const workspaceId = req.params.workspaceId || req.params.id;
  const userId = req.userId;

  try {
    const result = await db.query(
      `SELECT role FROM workspace_members
       WHERE workspace_id = $1 AND user_id = $2`,
      [workspaceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    const userRole = result.rows[0].role;
    if (ROLE_RANK[userRole] < ROLE_RANK[minRole]) {
      return res.status(403).json({
        error: `Requires ${minRole} role. You are a ${userRole}.`
      });
    }

    req.workspaceRole = userRole;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── Activity log helper (shared across routes) ────────────────────────────
async function logActivity(boardId, userId, action, entityType, entityId, entityTitle, metadata = {}) {
  try {
    await db.query(
      `INSERT INTO activity_logs
       (board_id, user_id, action, entity_type, entity_id, entity_title, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [boardId, userId, action, entityType, entityId, entityTitle, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

module.exports.logActivity = logActivity;

// ══════════════════════════════════════════════════════════════════════════
// WORKSPACE ROUTES
// ══════════════════════════════════════════════════════════════════════════

// POST /api/workspaces — Create workspace
router.post('/workspaces', async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Workspace name is required' });
  }

  try {
    // Create workspace
    const wsResult = await db.query(
      `INSERT INTO workspaces (name, owner_id) VALUES ($1, $2) RETURNING *`,
      [name.trim(), userId]
    );
    const workspace = wsResult.rows[0];

    // Auto-add creator as admin
    await db.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [workspace.id, userId]
    );

    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workspaces — Get all workspaces for current user
router.get('/workspaces', async (req, res) => {
  const userId = req.userId;
  try {
    const result = await db.query(
      `SELECT w.*, wm.role,
              COUNT(wm2.id) as member_count
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = $1
       JOIN workspace_members wm2 ON wm2.workspace_id = w.id
       GROUP BY w.id, wm.role
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workspaces/:id — Get single workspace with members
router.get('/workspaces/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Check membership
    const member = await db.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    const ws = await db.query(`SELECT * FROM workspaces WHERE id = $1`, [id]);
    const members = await db.query(
      `SELECT u.id, u.username, wm.role, wm.joined_at
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY wm.role DESC, u.username ASC`,
      [id]
    );

    res.json({ ...ws.rows[0], members: members.rows, myRole: member.rows[0].role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workspaces/:id/invite — Invite member by username
router.post('/workspaces/:id/invite', async (req, res) => {
  const { id } = req.params;
  const { username, role = 'member' } = req.body;

  if (!['admin', 'manager', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    await requireWorkspaceRole(req, res, async () => {}, 'admin');

    // Check caller is admin
    const callerRole = await db.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, req.userId]
    );
    if (!callerRole.rows[0] || callerRole.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite members' });
    }

    // Find user by username
    const userResult = await db.query(
      `SELECT id, username FROM users WHERE username = $1`,
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: `User "${username}" not found` });
    }
    const invitee = userResult.rows[0];

    // Check if already a member
    const existing = await db.query(
      `SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, invitee.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    await db.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)`,
      [id, invitee.id, role]
    );

    res.status(201).json({ message: `${invitee.username} added as ${role}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workspaces/:id/members/:userId — Change member role
router.put('/workspaces/:id/members/:memberId', async (req, res) => {
  const { id, memberId } = req.params;
  const { role } = req.body;
  const callerId = req.userId;

  if (!['admin', 'manager', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Only admins can change roles
    const callerRole = await db.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, callerId]
    );
    if (!callerRole.rows[0] || callerRole.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    // Cannot demote yourself
    if (parseInt(memberId) === callerId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await db.query(
      `UPDATE workspace_members SET role = $1
       WHERE workspace_id = $2 AND user_id = $3 RETURNING *`,
      [role, id, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Role updated', ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/workspaces/:id/members/:memberId — Remove member
router.delete('/workspaces/:id/members/:memberId', async (req, res) => {
  const { id, memberId } = req.params;
  const callerId = req.userId;

  try {
    const callerRole = await db.query(
      `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, callerId]
    );
    if (!callerRole.rows[0] || callerRole.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    if (parseInt(memberId) === callerId) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    await db.query(
      `DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
      [id, memberId]
    );

    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workspaces/:id/members — List members (for dropdowns)
router.get('/workspaces/:id/members', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT u.id, u.username, wm.role
       FROM workspace_members wm
       JOIN users u ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY u.username`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.requireWorkspaceRole = requireWorkspaceRole;
module.exports.logActivity = logActivity;
