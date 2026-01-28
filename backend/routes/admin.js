const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Получить статистику (администратор)
router.get('/statistics', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Статистика платежей
    const paymentStats = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments
       FROM payments`
    );

    // Статистика посещений
    const attendanceStats = await pool.query(
      `SELECT 
        COUNT(DISTINCT user_id) as unique_students,
        COUNT(*) as total_meals_received
       FROM orders
       WHERE status = 'received'`
    );

    // Статистика по мясу в месяц
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
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Получить отчет по затратам (администратор)
router.get('/expenses-report', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
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
       ORDER BY pr.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения отчета:', error);
    res.status(500).json({ error: 'Ошибка при получении отчета' });
  }
});

// Согласовать заявку на закупку (администратор)
router.put('/purchase-requests/:requestId/approve', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvalStatus } = req.body; // 'approved' или 'rejected'

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ error: 'Недействительный статус' });
    }

    const result = await pool.query(
      `UPDATE purchase_requests 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvalStatus, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    res.json({
      message: `Заявка ${approvalStatus === 'approved' ? 'одобрена' : 'отклонена'}`,
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка согласования заявки:', error);
    res.status(500).json({ error: 'Ошибка при согласовании заявки' });
  }
});

// Получить пользователей (администратор)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

module.exports = router;
