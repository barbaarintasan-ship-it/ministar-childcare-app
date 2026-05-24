const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, cl.name as classroom_name FROM staff s
       LEFT JOIN classrooms cl ON cl.id=s.classroom_id ORDER BY s.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, role, classroom_id, email, phone, status, certifications } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO staff (name,role,classroom_id,email,phone,status,certifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, role || 'Teacher', classroom_id, email, phone, status || 'active', certifications || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const fields = ['name','role','classroom_id','email','phone','status','certifications'];
  const updates = [];
  const values = [];
  let i = 1;
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f}=$${i++}`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
  values.push(req.params.id);
  try {
    const result = await db.query(
      `UPDATE staff SET ${updates.join(',')}, updated_at=now() WHERE id=$${i} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await db.query('DELETE FROM staff WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
