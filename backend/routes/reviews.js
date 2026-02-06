const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Добавить отзыв о блюде (ученик)
router.post('/', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { mealId, rating, comment } = req.body;

    // Проверяем, что mealId и rating являются числами
    const mealIdNum = Number(mealId);
    const ratingNum = Number(rating);

    if (!Number.isInteger(mealIdNum) || mealIdNum <= 0 || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Недействительный рейтинг (1-5) или ID блюда' });
    }

    const mealCheck = await pool.query('SELECT id FROM menu WHERE id = $1', [mealIdNum]);
    if (mealCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Блюдо не найдено в меню' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, meal_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [req.user.id, mealIdNum, ratingNum, comment || null]
    );

    res.status(201).json({
      message: 'Отзыв добавлен',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(500).json({ error: 'Ошибка при добавлении отзыва' });
  }
});

// Получить позиции из текущих остатков для отзывов (ученик)
router.get('/inventory-items', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, item_name
       FROM inventory
       WHERE quantity > 0
       ORDER BY item_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения остатков для отзывов:', error);
    res.status(500).json({ error: 'Ошибка при получении списка остатков' });
  }
});

// Добавить отзыв по продукту из остатков (ученик)
router.post('/inventory', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const { inventoryId, rating, comment } = req.body;

    const inventoryIdNum = Number(inventoryId);
    const ratingNum = Number(rating);

    if (!Number.isInteger(inventoryIdNum) || inventoryIdNum <= 0 || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Недействительный рейтинг (1-5) или ID продукта' });
    }

    const inventoryCheck = await pool.query('SELECT id FROM inventory WHERE id = $1', [inventoryIdNum]);
    if (inventoryCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Продукт не найден в остатках' });
    }

    const result = await pool.query(
      `INSERT INTO inventory_reviews (user_id, inventory_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [req.user.id, inventoryIdNum, ratingNum, comment || null]
    );

    res.status(201).json({
      message: 'Отзыв добавлен',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка добавления отзыва по продукту:', error);
    res.status(500).json({
      error: 'Ошибка при добавлении отзыва',
      details: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// Получить отзывы по блюду
router.get('/meal/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;

    const result = await pool.query(
      `SELECT r.id, r.user_id, u.full_name, r.rating, r.comment, r.created_at
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.meal_id = $1
       ORDER BY r.created_at DESC`,
      [mealId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
});

// Получить среднюю оценку блюда
router.get('/average/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;

    const result = await pool.query(
      `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
       FROM reviews
       WHERE meal_id = $1`,
      [mealId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения средней оценки:', error);
    res.status(500).json({ error: 'Ошибка при получении оценки' });
  }
});

module.exports = router;
