const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Создать платеж (ученик)
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { amount, paymentType } = req.body; // paymentType: 'one-time' или 'subscription'

    if (!amount || !paymentType) {
      return res.status(400).json({ error: 'Необходимы сумма и тип платежа' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительной' });
    }

    // Обновляем баланс пользователя
    const userResult = await pool.query(
      `UPDATE users
       SET balance = balance + $1
       WHERE id = $2
       RETURNING balance`,
      [amount, req.user.id]
    );

    // Создаем платеж
    const result = await pool.query(
      `INSERT INTO payments (user_id, amount, payment_type, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING *`,
      [req.user.id, amount, paymentType]
    );

    res.status(201).json({
      message: 'Платеж создан',
      payment: result.rows[0],
      balance: userResult.rows[0].balance
    });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
});

// Пополнить баланс (ученик)
router.post('/deposit', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительной' });
    }

    // Обновляем баланс пользователя
    const userResult = await pool.query(
      `UPDATE users
       SET balance = balance + $1
       WHERE id = $2
       RETURNING balance`,
      [amount, req.user.id]
    );

    // Создаем запись о платеже
    const paymentResult = await pool.query(
      `INSERT INTO payments (user_id, amount, payment_type, status, created_at)
       VALUES ($1, $2, 'deposit', 'completed', NOW())
       RETURNING *`,
      [req.user.id, amount]
    );

    res.status(201).json({
      message: 'Баланс успешно пополнен',
      balance: userResult.rows[0].balance,
      payment: paymentResult.rows[0]
    });
  } catch (error) {
    console.error('Ошибка пополнения баланса:', error);
    res.status(500).json({ error: 'Ошибка при пополнении баланса' });
  }
});

// Получить историю платежей (ученик)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, amount, payment_type, status, created_at
       FROM payments 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения истории платежей:', error);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
});

// Подтвердить платеж (администратор)
router.put('/:paymentId/confirm', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await pool.query(
      `UPDATE payments 
       SET status = 'completed', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    res.json({
      message: 'Платеж подтвержден',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка подтверждения платежа:', error);
    res.status(500).json({ error: 'Ошибка при подтверждении платежа' });
  }
});

module.exports = router;
