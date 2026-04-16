const express = require('express');
const router = express.Router();
const pool = require('./db');

/* ✅ GET BOARD */
router.get('/board/:id', async (req, res) => {
  try {
    const boardId = req.params.id;

    const lists = await pool.query(
      'SELECT * FROM lists WHERE board_id=$1 ORDER BY position',
      [boardId]
    );

    const cards = await pool.query(
      'SELECT * FROM cards WHERE list_id IN (SELECT id FROM lists WHERE board_id=$1)',
      [boardId]
    );

    res.json({ lists: lists.rows, cards: cards.rows });
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

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/* ✅ CREATE CARD */
router.post('/cards', async (req, res) => {
  try {
    const { title, list_id } = req.body;

    const result = await pool.query(
      'INSERT INTO cards(title, list_id, position) VALUES($1,$2,$3) RETURNING *',
      [title, list_id, 0]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
router.put('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { list_id, position } = req.body;

  try {
    const result = await pool.query(
      'UPDATE cards SET list_id=$1, position=$2 WHERE id=$3 RETURNING *',
      [list_id, position, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
router.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM cards WHERE id=$1', [id]);
  res.send("Deleted");
});

module.exports = router;