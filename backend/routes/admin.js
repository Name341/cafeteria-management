const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get statistics (admin)
router.get('/statistics', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const paymentStats = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments
       FROM payments`
    );

    const attendanceStats = await pool.query(
      `SELECT 
        COUNT(DISTINCT user_id) as unique_students,
        COUNT(*) as total_meals_received
       FROM orders
       WHERE status = 'received'`
    );

    const monthlyStats = await pool.query(
      `SELECT 
        DATE_TRUNC('month', o.order_date) as month,
        COUNT(*) as meals_count,
        SUM(m.price) as total_revenue
       FROM orders o
       LEFT JOIN menu m ON o.meal_id = m.id
       WHERE o.status = 'received'
       GROUP BY DATE_TRUNC('month', o.order_date)
       ORDER BY month DESC
       LIMIT 12`
    );

    res.json({
      payments: paymentStats.rows[0],
      attendance: attendanceStats.rows[0],
      monthlyStatistics: monthlyStats.rows
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Expenses report (admin)
router.get('/expenses-report', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = [];
    const values = [];

    if (startDate) {
      values.push(startDate);
      filters.push(`DATE(pr.created_at) >= $${values.length}`);
    }
    if (endDate) {
      values.push(endDate);
      filters.push(`DATE(pr.created_at) <= $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT 
        pr.id,
        pr.item_name,
        pr.quantity,
        pr.unit_price,
        pr.total_cost,
        pr.status,
        pr.created_at
       FROM purchase_requests pr
       ${whereClause}
       ORDER BY pr.created_at DESC`,
      values
    );

    const totals = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        COALESCE(SUM(pr.total_cost), 0) as total_cost
       FROM purchase_requests pr
       ${whereClause}`,
      values
    );

    res.json({
      items: result.rows,
      totals: totals.rows[0]
    });
  } catch (error) {
    console.error('Error fetching expenses report:', error);
    res.status(500).json({ error: 'Error fetching expenses report' });
  }
});

// Nutrition report (admin)
router.get('/nutrition-report', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = [`o.status = 'received'`];
    const values = [];

    if (startDate) {
      values.push(startDate);
      filters.push(`o.order_date >= $${values.length}`);
    }
    if (endDate) {
      values.push(endDate);
      filters.push(`o.order_date <= $${values.length}`);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const items = await pool.query(
      `SELECT 
        m.id,
        m.name,
        m.meal_type,
        COUNT(*) as orders_count,
        COALESCE(SUM(o.portion_size), 0) as total_portions,
        COALESCE(SUM(m.price * o.portion_size), 0) as total_amount
       FROM orders o
       JOIN menu m ON o.meal_id = m.id
       ${whereClause}
       GROUP BY m.id, m.name, m.meal_type
       ORDER BY total_portions DESC, m.name ASC`,
      values
    );

    const totals = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(o.portion_size), 0) as total_portions,
        COALESCE(SUM(m.price * o.portion_size), 0) as total_amount
       FROM orders o
       JOIN menu m ON o.meal_id = m.id
       ${whereClause}`,
      values
    );

    res.json({
      items: items.rows,
      totals: totals.rows[0]
    });
  } catch (error) {
    console.error('Error fetching nutrition report:', error);
    res.status(500).json({ error: 'Error fetching nutrition report' });
  }
});

// Revenue report (admin)
router.get('/revenue-report', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filters = [`p.status = 'completed'`];
    const values = [];

    if (startDate) {
      values.push(startDate);
      filters.push(`DATE(p.created_at) >= $${values.length}`);
    }
    if (endDate) {
      values.push(endDate);
      filters.push(`DATE(p.created_at) <= $${values.length}`);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const items = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.amount,
        p.payment_type,
        p.status,
        p.created_at
       FROM payments p
       ${whereClause}
       ORDER BY p.created_at DESC`,
      values
    );

    const totals = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_amount
       FROM payments p
       ${whereClause}`,
      values
    );

    res.json({
      items: items.rows,
      totals: totals.rows[0]
    });
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({ error: 'Error fetching revenue report' });
  }
});

// Approve purchase request (admin)
router.put('/purchase-requests/:requestId/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvalStatus } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE purchase_requests 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvalStatus, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      message: `Request ${approvalStatus === 'approved' ? 'approved' : 'rejected'}`,
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Error approving request' });
  }
});

// Get users (admin)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;
