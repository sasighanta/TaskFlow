const express = require("express");
const router = express.Router();
const pool = require("./db");

/*
=========================================
GET ALL BOARDS OF A USER
GET /api/users/:userId/boards
=========================================
*/
router.get("/users/:userId/boards", async (req, res) => {
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

/*
=========================================
CREATE BOARD
POST /api/boards
=========================================
*/
router.post("/boards", async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Board title is required",
      });
    }

    const boardResult = await pool.query(
      `
      INSERT INTO boards(title, user_id)
      VALUES($1,$2)
      RETURNING *;
      `,
      [title.trim(), userId]
    );

    const board = boardResult.rows[0];

    await pool.query(
      `
      INSERT INTO lists(title, board_id, position)
      VALUES
      ('To Do',$1,1),
      ('In Progress',$1,2),
      ('Done',$1,3);
      `,
      [board.id]
    );

    res.status(201).json(board);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Unable to create board",
    });
  }
});

/*
=========================================
RENAME BOARD
PUT /api/boards/:id
=========================================
*/
router.put("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const result = await pool.query(
      `
      UPDATE boards
      SET title=$1
      WHERE id=$2
      RETURNING *;
      `,
      [title, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Unable to rename board",
    });
  }
});

/*
=========================================
DELETE BOARD
DELETE /api/boards/:id
=========================================
*/
router.delete("/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM boards
      WHERE id=$1;
      `,
      [id]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Unable to delete board",
    });
  }
});

module.exports = router;