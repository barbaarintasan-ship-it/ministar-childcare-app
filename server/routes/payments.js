const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/payments
router.get('/', auth, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'parent') {
      result = await db.query(
        `SELECT p.*, c.first_name, c.last_name FROM payments p
         JOIN children c ON c.id=p.child_id
         WHERE p.parent_id=$1 ORDER BY p.due_date DESC`,
        [req.user.id]
      );
    } else {
      result = await db.query(
        `SELECT p.*, c.first_name, c.last_name FROM payments p
         JOIN children c ON c.id=p.child_id
         ORDER BY p.due_date DESC`
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { child_id, parent_id, amount, description, payment_type, due_date } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO payments (child_id,parent_id,amount,description,payment_type,due_date,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [child_id, parent_id, amount, description, payment_type || 'Tuition', due_date, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/payments/:id/pay
router.put('/:id/pay', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const result = await db.query(
      `UPDATE payments SET status='paid', paid_date=current_date, updated_at=now()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await db.query('DELETE FROM payments WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
