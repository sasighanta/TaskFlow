const express = require('express');
const router = express.Router();
const pool = require('./db');

// ══════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG HELPER
// ══════════════════════════════════════════════════════════════════════════
async function logActivity(boardId, userId, action, entityType, entityId, entityTitle, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO activity_logs
       (board_id, user_id, action, entity_type, entity_id, entity_title, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [boardId, userId, action, entityType, entityId, entityTitle, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

/* ✅ GET BOARD BY USER ID */
router.get('/user/:userId/board', async (req, res) => {
  try {
    const { userId } = req.params;
    const board = await pool.query('SELECT * FROM boards WHERE user_id=$1 LIMIT 1', [userId]);
    if (board.rows.length === 0) return res.status(404).json({ error: "No board found" });
    const boardId = board.rows[0].id;
    const lists = await pool.query('SELECT * FROM lists WHERE board_id=$1 ORDER BY position', [boardId]);
    const cards = await pool.query('SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1) ORDER BY position', [boardId]);
    res.json({ board: board.rows[0], lists: lists.rows, cards: cards.rows });
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ✅ GET BOARD */
router.get('/board/:id', async (req, res) => {
  try {
    const boardId = req.params.id;
    const lists = await pool.query('SELECT * FROM lists WHERE board_id=$1 ORDER BY position', [boardId]);
    const cards = await pool.query('SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1) ORDER BY position', [boardId]);
    res.json({ lists: lists.rows, cards: cards.rows });
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ✅ GET ACTIVITY LOG */
router.get('/boards/:boardId/activity', async (req, res) => {
  const { boardId } = req.params;
  try {
    const result = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_title,
              al.metadata, al.created_at, u.username, u.id as user_id
       FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       WHERE al.board_id = $1
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [boardId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ✅ REORDER CARDS */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ CREATE LIST */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ CREATE CARD */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ MOVE CARD */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ UPDATE CARD TITLE */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ UPDATE CARD DESCRIPTION */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ UPDATE LIST TITLE */
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
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ DELETE CARD */
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

/* ✅ DELETE LIST */
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
/* ✅ UPDATE CARD META (priority, status, labels) */
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
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'card-updated', payload: { card: updatedCard }
      });
    }
    res.json(updatedCard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
