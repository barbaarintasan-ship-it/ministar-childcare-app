const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/children
router.get('/', auth, async (req, res) => {
  try {
    let q, params;
    if (req.user.role === 'parent') {
      q = `SELECT c.*, cl.name as classroom_name, cl.emoji as classroom_emoji
           FROM children c LEFT JOIN classrooms cl ON cl.id=c.classroom_id
           WHERE c.parent_id=$1 AND c.active=true ORDER BY c.first_name`;
      params = [req.user.id];
    } else {
      q = `SELECT c.*, cl.name as classroom_name, cl.emoji as classroom_emoji
           FROM children c LEFT JOIN classrooms cl ON cl.id=c.classroom_id
           WHERE c.active=true ORDER BY c.first_name`;
      params = [];
    }
    const result = await db.query(q, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/children/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, cl.name as classroom_name FROM children c
       LEFT JOIN classrooms cl ON cl.id=c.classroom_id WHERE c.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/children
router.post('/', auth, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const { first_name, last_name, age, classroom_id, parent_id, allergies, emoji, enroll_date, date_of_birth } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO children (first_name,last_name,age,classroom_id,parent_id,allergies,emoji,enroll_date,date_of_birth,allergy_alert)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [first_name, last_name, age || 3, classroom_id, parent_id, allergies || [], emoji || '👶',
       enroll_date || new Date().toISOString().split('T')[0], date_of_birth,
       allergies && allergies.length > 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/children/:id
router.put('/:id', auth, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  const fields = ['first_name','last_name','age','classroom_id','allergies','emoji','status',
                  'checkin_time','checkout_time','mood','mood_emoji','teacher_note','medical_notes'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f}=$${i++}`);
      values.push(req.body[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
  values.push(req.params.id);
  try {
    const result = await db.query(
      `UPDATE children SET ${updates.join(',')}, updated_at=now() WHERE id=$${i} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/children/:id
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await db.query('UPDATE children SET active=false WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
