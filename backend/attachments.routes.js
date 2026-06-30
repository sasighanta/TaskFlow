// ══════════════════════════════════════════════════════════════════════════
// attachments.routes.js
// New file: backend/attachments.routes.js
// ══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const pool = require('./db');

// ── Supabase client (uses your project URL + anon key) ─────────────────────
const supabase = createClient(
  'https://fmywjfrmgucvsuxtapcj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZteXdqZnJtZ3VjdnN1eHRhcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzY5NjgsImV4cCI6MjA5MTc1Mjk2OH0.cDfaNcPA2K_-3ulS63qHtsMuV_XgB3JLmg4Pf50DdK4'
);

// ── Multer config: store file in memory, max 10MB ───────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ✅ UPLOAD FILE TO A CARD */
router.post('/cards/:cardId/attachments', upload.single('file'), async (req, res) => {
  const { cardId } = req.params;
  const { boardId, userId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // Unique filename to avoid collisions
    const timestamp = Date.now();
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `cards/${cardId}/${timestamp}_${safeFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);

    // Save record in DB
    const result = await pool.query(
      `INSERT INTO file_attachments (card_id, uploader_id, filename, storage_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cardId, userId, file.originalname, storagePath, file.size, file.mimetype]
    );

    const attachment = { ...result.rows[0], url: urlData.publicUrl };

    // Emit real-time update
    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'attachment-added',
        payload: { cardId, attachment }
      });
    }

    res.status(201).json(attachment);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ✅ GET ATTACHMENTS FOR A CARD */
router.get('/cards/:cardId/attachments', async (req, res) => {
  const { cardId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM file_attachments WHERE card_id=$1 ORDER BY uploaded_at DESC`,
      [cardId]
    );

    // Attach public URLs
    const attachments = result.rows.map(a => {
      const { data } = supabase.storage.from('attachments').getPublicUrl(a.storage_path);
      return { ...a, url: data.publicUrl };
    });

    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ✅ DELETE ATTACHMENT */
router.delete('/attachments/:id', async (req, res) => {
  const { id } = req.params;
  const { boardId, cardId } = req.body;

  try {
    const result = await pool.query('SELECT * FROM file_attachments WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const attachment = result.rows[0];

    // Delete from Supabase Storage
    await supabase.storage.from('attachments').remove([attachment.storage_path]);

    // Delete from DB
    await pool.query('DELETE FROM file_attachments WHERE id=$1', [id]);

    if (boardId) {
      const io = req.app.get('io');
      io.to(`board:${boardId}`).emit('board-updated', {
        type: 'attachment-deleted',
        payload: { cardId, attachmentId: id }
      });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
