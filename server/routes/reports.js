const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/reports/attendance-weekly
router.get('/attendance-weekly', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        to_char(date, 'Dy') as day,
        date,
        COUNT(CASE WHEN status='checked_in' OR status='checked_out' THEN 1 END) as present,
        COUNT(CASE WHEN status='absent' THEN 1 END) as absent
      FROM attendance
      WHERE date >= current_date - interval '6 days'
      GROUP BY date ORDER BY date
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/summary
router.get('/summary', auth, async (req, res) => {
  try {
    const [children, staff, todayAtt, revenue] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM children WHERE active=true'),
      db.query("SELECT COUNT(*) as total FROM staff WHERE status='active'"),
      db.query(`
        SELECT
          COUNT(CASE WHEN status IN ('checked_in','checked_out') THEN 1 END) as present,
          COUNT(CASE WHEN status='absent' THEN 1 END) as absent
        FROM attendance WHERE date=current_date
      `),
      db.query(`
        SELECT
          SUM(CASE WHEN status='paid' THEN amount ELSE 0 END) as collected,
          SUM(CASE WHEN status='overdue' THEN amount ELSE 0 END) as overdue,
          SUM(CASE WHEN status='upcoming' THEN amount ELSE 0 END) as upcoming
        FROM payments
        WHERE date_trunc('month', due_date) = date_trunc('month', current_date)
      `),
    ]);
    res.json({
      totalChildren: parseInt(children.rows[0].total),
      totalStaff: parseInt(staff.rows[0].total),
      presentToday: parseInt(todayAtt.rows[0].present),
      absentToday: parseInt(todayAtt.rows[0].absent),
      monthlyRevenue: parseFloat(revenue.rows[0].collected) || 0,
      overdueAmount: parseFloat(revenue.rows[0].overdue) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
