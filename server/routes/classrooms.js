const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/classrooms
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM classrooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
