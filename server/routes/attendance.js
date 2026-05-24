const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/attendance?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const result = await db.query(
      `SELECT a.*, c.first_name, c.last_name, c.emoji,
              cl.name as classroom_name
       FROM attendance a
       JOIN children c ON c.id=a.child_id
       LEFT JOIN classrooms cl ON cl.id=c.classroom_id
       WHERE a.date=$1 ORDER BY c.first_name`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/attendance/:childId — upsert
router.put('/:childId', auth, async (req, res) => {
  if (!['teacher','admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { status, checkin_time, checkout_time, notes } = req.body;
  const date = req.body.date || new Date().toISOString().split('T')[0];
  try {
    const result = await db.query(
      `INSERT INTO attendance (child_id,date,status,checkin_time,checkout_time,checked_in_by,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (child_id,date) DO UPDATE
       SET status=$3, checkin_time=COALESCE($4,attendance.checkin_time),
           checkout_time=COALESCE($5,attendance.checkout_time),
           checked_in_by=COALESCE($6,attendance.checked_in_by),
           notes=COALESCE($7,attendance.notes),
           updated_at=now()
       RETURNING *`,
      [req.params.childId, date, status, checkin_time || null, checkout_time || null, req.user.id, notes || null]
    );
    // also update children.status
    await db.query('UPDATE children SET status=$1 WHERE id=$2', [status, req.params.childId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
