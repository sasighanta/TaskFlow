const express = require('express');
const router = express.Router();
const pool = require('./db');

async function logActivity(boardId, userId, action, entityType, entityId, entityTitle, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (board_id, user_id, action, entity_type, entity_id, entity_title, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [boardId, userId, action, entityType, entityId, entityTitle, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

router.get('/user/:userId/boards', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        b.id,
        b.title,
        b.created_at,
        COUNT(DISTINCT l.id) AS list_count,
        COUNT(DISTINCT c.id) AS card_count
      FROM boards b
      LEFT JOIN lists l
        ON l.board_id = b.id
      LEFT JOIN cards c
        ON c.list_id = l.id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch boards",
    });
  }
});

router.post('/boards', async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Board title is required",
      });
    }

    // Create board
    const boardResult = await pool.query(
      `INSERT INTO boards(title, user_id)
       VALUES($1,$2)
       RETURNING *`,
      [title.trim(), userId]
    );

    const board = boardResult.rows[0];

    // Create default lists
    await pool.query(
      `
      INSERT INTO lists(title, board_id, position)
      VALUES
      ('To Do',$1,1),
      ('In Progress',$1,2),
      ('Done',$1,3)
      `,
      [board.id]
    );

    res.status(201).json(board);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to create board",
    });
  }
});

router.get('/board/:id', async (req, res) => {
  try {
    const boardId = req.params.id;
    const lists = await pool.query('SELECT * FROM lists WHERE board_id=$1 ORDER BY position', [boardId]);
    const cards = await pool.query('SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1) ORDER BY position', [boardId]);
    res.json({ lists: lists.rows, cards: cards.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/boards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await pool.query(
      "SELECT * FROM boards WHERE id=$1",
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        error: "Board not found",
      });
    }

    await pool.query(
      "DELETE FROM boards WHERE id=$1",
      [id]
    );

    res.json({
      message: "Board deleted successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to delete board",
    });
  }
});

router.get('/boards/:boardId/activity', async (req, res) => {
  const { boardId } = req.params;
  try {
    const result = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_title, al.metadata, al.created_at, u.username, u.id as user_id
       FROM activity_logs al JOIN users u ON u.id = al.user_id
       WHERE al.board_id = $1 ORDER BY al.created_at DESC LIMIT 50`,
      [boardId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/cards/reorder', async (req, res) => {
  const { cards, boardId, userId, movedCard, fromList, toList } = req.body;
  try {
    const listsMap = {};
    for (let card of cards) {
      if (!listsMap[card.list_id]) listsMap[card.list_id] = [];
      listsMap[card.list_id].push(card);
    }
    for (let listId in listsMap) {
      const listCards = listsMap[listId];
      for (let i = 0; i < listCards.length; i++) {
        await pool.query('UPDATE cards SET list_id=$1, position=$2 WHERE id=$3', [listCards[i].list_id, i, listCards[i].id]);
      }
    }
    if (movedCard && fromList !== toList) {
      await logActivity(boardId, userId, 'moved card', 'card', movedCard.id, movedCard.title, { from: fromList, to: toList });
    }
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'cards-reordered', payload: { cards } });
    }
    res.send("Reordered correctly");
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.post('/lists', async (req, res) => {
  try {
    const { title, board_id, userId } = req.body;
    const result = await pool.query('INSERT INTO lists(title, board_id, position) VALUES($1,$2,$3) RETURNING *', [title, board_id, 0]);
    const newList = result.rows[0];
    await logActivity(board_id, userId, 'created list', 'list', newList.id, title);
    const io = req.app.get('io');
    io.to(`board:${board_id}`).emit('board-updated', { type: 'list-created', payload: { list: newList } });
    res.json(newList);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.post('/cards', async (req, res) => {
  try {
    const { title, list_id, tag, tag_label, boardId, userId } = req.body;
    const result = await pool.query('INSERT INTO cards(title, list_id, position, tag, tag_label) VALUES($1,$2,$3,$4,$5) RETURNING *', [title, list_id, 0, tag, tag_label]);
    const newCard = result.rows[0];
    await logActivity(boardId, userId, 'created card', 'card', newCard.id, title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-created', payload: { card: newCard } });
    }
    res.json(newCard);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.put('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { list_id, position, boardId, userId } = req.body;
  try {
    await pool.query(`UPDATE cards SET position = position + 1 WHERE list_id = $1 AND position >= $2`, [list_id, position]);
    const result = await pool.query(`UPDATE cards SET list_id = $1, position = $2 WHERE id = $3 RETURNING *`, [list_id, position, id]);
    const updatedCard = result.rows[0];
    await logActivity(boardId, userId, 'moved card', 'card', id, updatedCard.title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-moved', payload: { card: updatedCard } });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.put('/cards/:id/title', async (req, res) => {
  const { id } = req.params;
  const { title, boardId, userId } = req.body;
  try {
    const result = await pool.query('UPDATE cards SET title=$1 WHERE id=$2 RETURNING *', [title, id]);
    const updatedCard = result.rows[0];
    await logActivity(boardId, userId, 'renamed card', 'card', id, title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-updated', payload: { card: updatedCard } });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.put('/cards/:id/description', async (req, res) => {
  const { id } = req.params;
  const { description, boardId, userId } = req.body;
  try {
    const result = await pool.query('UPDATE cards SET description=$1 WHERE id=$2 RETURNING *', [description, id]);
    const updatedCard = result.rows[0];
    await logActivity(boardId, userId, 'updated description', 'card', id, updatedCard.title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-updated', payload: { card: updatedCard } });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.put('/lists/:id', async (req, res) => {
  const { id } = req.params;
  const { title, boardId, userId } = req.body;
  try {
    const result = await pool.query('UPDATE lists SET title=$1 WHERE id=$2 RETURNING *', [title, id]);
    const updatedList = result.rows[0];
    await logActivity(boardId, userId, 'renamed list', 'list', id, title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'list-updated', payload: { list: updatedList } });
    }
    res.json(updatedList);
  } catch (err) {
    res.status(500).send("Error");
  }
});

router.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { boardId, userId } = req.body;
  const cardResult = await pool.query('SELECT title FROM cards WHERE id=$1', [id]);
  const cardTitle = cardResult.rows[0]?.title || 'Unknown card';
  await pool.query('DELETE FROM cards WHERE id=$1', [id]);
  await logActivity(boardId, userId, 'deleted card', 'card', id, cardTitle);
  if (boardId) {
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('board-updated', { type: 'card-deleted', payload: { cardId: id } });
  }
  res.send("Deleted");
});

router.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;
  const { boardId, userId } = req.body;
  const listResult = await pool.query('SELECT title FROM lists WHERE id=$1', [id]);
  const listTitle = listResult.rows[0]?.title || 'Unknown list';
  await pool.query('DELETE FROM cards WHERE list_id=$1', [id]);
  await pool.query('DELETE FROM lists WHERE id=$1', [id]);
  await logActivity(boardId, userId, 'deleted list', 'list', id, listTitle);
  if (boardId) {
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('board-updated', { type: 'list-deleted', payload: { listId: id } });
  }
  res.send("Deleted");
});

router.put('/cards/:id/meta', async (req, res) => {
  const { id } = req.params;
  const { priority, status, labels, boardId, userId } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cards SET priority=$1, status=$2, labels=$3 WHERE id=$4 RETURNING *`,
      [priority, status, labels, id]
    );
    const updatedCard = result.rows[0];
    await logActivity(boardId, userId, 'updated card details', 'card', id, updatedCard.title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-updated', payload: { card: updatedCard } });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/cards/:id/due-date', async (req, res) => {
  const { id } = req.params;
  const { due_date, boardId, userId } = req.body;
  try {
    const result = await pool.query('UPDATE cards SET due_date=$1 WHERE id=$2 RETURNING *', [due_date, id]);
    const updatedCard = result.rows[0];
    await logActivity(boardId, userId, 'set due date', 'card', id, updatedCard.title);
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', { type: 'card-updated', payload: { card: updatedCard } });
    }
    res.json(updatedCard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT n.*, c.title as card_title FROM notifications n
       LEFT JOIN cards c ON n.card_id = c.id
       WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT 30`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications/:userId/read-all', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read=true WHERE user_id=$1 AND is_read=false', [userId]);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/boards/:boardId/search', async (req, res) => {
  const { boardId } = req.params;
  const { q, priority, status, label, overdue } = req.query;
  try {
    let conditions = ['l.board_id = $1'];
    let params = [boardId];
    if (q) { params.push(`%${q}%`); conditions.push(`(c.title ILIKE $${params.length} OR c.description ILIKE $${params.length})`); }
    if (priority) { params.push(priority); conditions.push(`c.priority = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`c.status = $${params.length}`); }
    if (label) { params.push(label); conditions.push(`$${params.length} = ANY(c.labels)`); }
    if (overdue === 'true') { conditions.push(`c.due_date < NOW() AND c.status != 'done'`); }
    const result = await pool.query(
      `SELECT c.*, l.title as list_title FROM cards c JOIN lists l ON c.list_id = l.id WHERE ${conditions.join(' AND ')} ORDER BY c.position`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/boards/:boardId/analytics', async (req, res) => {
  const { boardId } = req.params;
  try {
    const statusResult = await pool.query(`SELECT status, COUNT(*) as count FROM cards c JOIN lists l ON c.list_id = l.id WHERE l.board_id = $1 GROUP BY status`, [boardId]);
    const priorityResult = await pool.query(`SELECT priority, COUNT(*) as count FROM cards c JOIN lists l ON c.list_id = l.id WHERE l.board_id = $1 GROUP BY priority`, [boardId]);
    const weeklyResult = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') as week, COUNT(*) as created
       FROM activity_logs WHERE board_id = $1 AND created_at > NOW() - interval '6 weeks'
       GROUP BY DATE_TRUNC('week', created_at) ORDER BY DATE_TRUNC('week', created_at)`,
      [boardId]
    );
    const listsResult = await pool.query(
      `SELECT l.title, COUNT(c.id) as count FROM lists l LEFT JOIN cards c ON c.list_id = l.id WHERE l.board_id = $1 GROUP BY l.id, l.title ORDER BY l.position`,
      [boardId]
    );
    const statsResult = await pool.query(
      `SELECT COUNT(*) as total_cards,
              COUNT(*) FILTER (WHERE c.status = 'done') as completed,
              COUNT(*) FILTER (WHERE c.due_date < NOW() AND c.status != 'done') as overdue,
              COUNT(*) FILTER (WHERE c.priority = 'critical') as critical
       FROM cards c JOIN lists l ON c.list_id = l.id WHERE l.board_id = $1`,
      [boardId]
    );
    const stats = statsResult.rows[0];
    const total = parseInt(stats.total_cards) || 1;
    res.json({
      statusBreakdown: statusResult.rows,
      priorityBreakdown: priorityResult.rows,
      weeklyActivity: weeklyResult.rows,
      cardsPerList: listsResult.rows,
      summary: {
        totalCards: parseInt(stats.total_cards),
        completed: parseInt(stats.completed),
        overdue: parseInt(stats.overdue),
        critical: parseInt(stats.critical),
        completionRate: Math.round((parseInt(stats.completed) / total) * 100),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cards/:cardId/comments", async (req, res) => {
  try {
    const { cardId } = req.params;

    const result = await pool.query(
      `
      SELECT
        comments.id,
        comments.comment,
        comments.created_at,
        users.id AS user_id,
        users.username
      FROM comments
      JOIN users
        ON comments.user_id = users.id
      WHERE comments.card_id = $1
      ORDER BY comments.created_at ASC
      `,
      [cardId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch comments",
    });
  }
});

router.post("/cards/:cardId/comments", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { userId, comment } = req.body;

    const result = await pool.query(
      `
      INSERT INTO comments(card_id, user_id, comment)
      VALUES($1,$2,$3)
      RETURNING *;
      `,
      [cardId, userId, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to add comment",
    });
  }
});

router.delete("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM comments WHERE id=$1",
      [id]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to delete comment",
    });
  }
});

module.exports = router;
