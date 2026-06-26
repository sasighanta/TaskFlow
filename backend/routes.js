const express = require('express');
const router = express.Router();
const pool = require('./db');

/* ✅ GET BOARD BY USER ID */
router.get('/user/:userId/board', async (req, res) => {
  try {
    const { userId } = req.params;
    const board = await pool.query(
      'SELECT * FROM boards WHERE user_id=$1 LIMIT 1',
      [userId]
    );
    if (board.rows.length === 0) {
      return res.status(404).json({ error: "No board found" });
    }
    const boardId = board.rows[0].id;
    const lists = await pool.query(
      'SELECT * FROM lists WHERE board_id=$1 ORDER BY position',
      [boardId]
    );
    const cards = await pool.query(
      'SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1) ORDER BY position',
      [boardId]
    );
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
    const lists = await pool.query(
      'SELECT * FROM lists WHERE board_id=$1 ORDER BY position',
      [boardId]
    );
    const cards = await pool.query(
      'SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1) ORDER BY position',
      [boardId]
    );
    res.json({ lists: lists.rows, cards: cards.rows });
  } catch (err) {
    console.error("DATABASE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ✅ REORDER CARDS (drag and drop) */
router.put('/cards/reorder', async (req, res) => {
  const { cards, boardId } = req.body; // ← also send boardId from frontend now

  try {
    const listsMap = {};
    for (let card of cards) {
      if (!listsMap[card.list_id]) listsMap[card.list_id] = [];
      listsMap[card.list_id].push(card);
    }

    for (let listId in listsMap) {
      const listCards = listsMap[listId];
      for (let i = 0; i < listCards.length; i++) {
        await pool.query(
          'UPDATE cards SET list_id=$1, position=$2 WHERE id=$3',
          [listCards[i].list_id, i, listCards[i].id]
        );
      }
    }

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'cards-reordered',
        payload: { cards }
      });
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
    const { title, board_id } = req.body;
    const result = await pool.query(
      'INSERT INTO lists(title, board_id, position) VALUES($1,$2,$3) RETURNING *',
      [title, board_id, 0]
    );
    const newList = result.rows[0];

    // 🔴 Emit to all users on this board
    const io = req.app.get('io');
    io.to(`board:${board_id}`).emit('board-updated', {
      type: 'list-created',
      payload: { list: newList }
    });

    res.json(newList);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ CREATE CARD */
router.post('/cards', async (req, res) => {
  try {
    const { title, list_id, tag, tag_label, boardId } = req.body; // ← also send boardId from frontend now
    const result = await pool.query(
      'INSERT INTO cards(title, list_id, position, tag, tag_label) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [title, list_id, 0, tag, tag_label]
    );
    const newCard = result.rows[0];

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'card-created',
        payload: { card: newCard }
      });
    }

    res.json(newCard);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ MOVE CARD (drag between lists) */
router.put('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { list_id, position, boardId } = req.body; // ← also send boardId from frontend now

  try {
    await pool.query(
      `UPDATE cards SET position = position + 1 WHERE list_id = $1 AND position >= $2`,
      [list_id, position]
    );
    const result = await pool.query(
      `UPDATE cards SET list_id = $1, position = $2 WHERE id = $3 RETURNING *`,
      [list_id, position, id]
    );
    const updatedCard = result.rows[0];

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'card-moved',
        payload: { card: updatedCard }
      });
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
  const { title, boardId } = req.body; // ← also send boardId from frontend now
  try {
    const result = await pool.query(
      'UPDATE cards SET title=$1 WHERE id=$2 RETURNING *',
      [title, id]
    );
    const updatedCard = result.rows[0];

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'card-updated',
        payload: { card: updatedCard }
      });
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
  const { description, boardId } = req.body; // ← also send boardId from frontend now
  try {
    const result = await pool.query(
      'UPDATE cards SET description=$1 WHERE id=$2 RETURNING *',
      [description, id]
    );
    const updatedCard = result.rows[0];

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'card-updated',
        payload: { card: updatedCard }
      });
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
  const { title, boardId } = req.body; // ← also send boardId from frontend now
  try {
    const result = await pool.query(
      'UPDATE lists SET title=$1 WHERE id=$2 RETURNING *',
      [title, id]
    );
    const updatedList = result.rows[0];

    // 🔴 Emit to all users on this board
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'list-updated',
        payload: { list: updatedList }
      });
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
  const { boardId } = req.body; // ← also send boardId from frontend now

  await pool.query('DELETE FROM cards WHERE id=$1', [id]);

  // 🔴 Emit to all users on this board
  if (boardId) {
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('board-updated', {
      type: 'card-deleted',
      payload: { cardId: id }
    });
  }

  res.send("Deleted");
});

/* ✅ DELETE LIST */
router.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;
  const { boardId } = req.body; // ← also send boardId from frontend now

  await pool.query('DELETE FROM cards WHERE list_id=$1', [id]);
  await pool.query('DELETE FROM lists WHERE id=$1', [id]);

  // 🔴 Emit to all users on this board
  if (boardId) {
    const io = req.app.get('io');
    io.to(`board:${boardId}`).emit('board-updated', {
      type: 'list-deleted',
      payload: { listId: id }
    });
  }

  res.send("Deleted");
});

module.exports = router;
