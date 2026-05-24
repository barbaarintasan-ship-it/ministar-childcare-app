const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/messages/:childId
router.get('/:childId', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, p.full_name as sender_name, p.role as sender_role
       FROM messages m
       JOIN profiles p ON p.id=m.sender_id
       WHERE m.child_id=$1
       ORDER BY m.created_at ASC`,
      [req.params.childId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  const { child_id, text, receiver_id } = req.body;
  if (!child_id || !text) return res.status(400).json({ error: 'child_id and text required' });
  try {
    const result = await db.query(
      `INSERT INTO messages (child_id, sender_id, receiver_id, text)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [child_id, req.user.id, receiver_id || null, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
