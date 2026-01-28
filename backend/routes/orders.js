const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Создать заказ (ученик)
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { mealId, date, portionSize = 1 } = req.body;

    if (!mealId || !date) {
      return res.status(400).json({ error: 'Необходимы мера и дата' });
    }

    const result = await pool.query(
      `INSERT INTO orders (user_id, meal_id, order_date, portion_size, status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW())
       RETURNING *`,
      [req.user.id, mealId, date, portionSize]
    );

    res.status(201).json({
      message: 'Заказ создан',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

// Отметить получение питания (ученик)
router.put('/:orderId/mark-received', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Проверка, что заказ принадлежит пользователю
    const checkOrder = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (checkOrder.rows.length === 0) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const result = await pool.query(
      `UPDATE orders 
       SET status = 'received', received_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    res.json({
      message: 'Получение питания отмечено',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка отметки получения:', error);
    res.status(500).json({ error: 'Ошибка при отметке получения' });
  }
});

// Получить свои заказы (ученик)
router.get('/my-orders', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.meal_id, m.name, m.description, o.order_date, o.status, o.received_at
       FROM orders o
       LEFT JOIN menu m ON o.meal_id = m.id
       WHERE o.user_id = $1
       ORDER BY o.order_date DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

// Получить все заказы на дату (повар)
router.get('/date/:date', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(
      `SELECT o.id, o.user_id, u.full_name, m.name, m.description, o.portion_size, o.status
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN menu m ON o.meal_id = m.id
       WHERE o.order_date = $1
       ORDER BY m.name, u.full_name`,
      [date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения заказов на дату:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

module.exports = router;
