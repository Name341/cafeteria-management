const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Получить меню на дату
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(
      `SELECT id, meal_type, name, description, price, allergens, calories, proteins, fats, carbs, created_at
       FROM menu 
       WHERE date = $1 
       ORDER BY meal_type, name`,
      [date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения меню:', error);
    res.status(500).json({ error: 'Ошибка при получении меню' });
  }
});

// Получить меню на месяц
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT id, date, meal_type, name, description, price
       FROM menu 
       WHERE date BETWEEN $1 AND $2
       ORDER BY date, meal_type`,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения меню за месяц:', error);
    res.status(500).json({ error: 'Ошибка при получении меню' });
  }
});

// Добавить блюдо в меню (только администратор)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const {
      date,
      mealType,
      name,
      description,
      price,
      allergens,
      calories,
      proteins,
      fats,
      carbs
    } = req.body;

    const result = await pool.query(
      `INSERT INTO menu (date, meal_type, name, description, price, allergens, calories, proteins, fats, carbs)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [date, mealType, name, description, price, allergens, calories, proteins, fats, carbs]
    );

    res.status(201).json({
      message: 'Блюдо добавлено в меню',
      dish: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка добавления блюда:', error);
    res.status(500).json({ error: 'Ошибка при добавлении блюда' });
  }
});

module.exports = router;
