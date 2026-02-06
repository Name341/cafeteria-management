const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Получить позиции для отзывов (по текущим остаткам)
router.get('/review-items', authenticateToken, authorizeRole('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name
       FROM menu m
       INNER JOIN inventory i ON LOWER(m.name) = LOWER(i.item_name)
       WHERE i.quantity > 0
       ORDER BY m.name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения списка для отзывов:', error);
    res.status(500).json({ error: 'Ошибка при получении списка для отзывов' });
  }
});

// Получить меню на дату
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Получаем основное меню
    const menuResult = await pool.query(
      `SELECT m.id, m.meal_type, m.name, m.description, m.price, m.allergens, m.calories, m.proteins, m.fats, m.carbs, m.created_at
       FROM menu m
       LEFT JOIN inventory i ON LOWER(m.name) = LOWER(i.item_name)
       WHERE m.date = $1 AND (i.quantity IS NULL OR i.quantity > 0)
       ORDER BY m.meal_type, m.name`,
      [date]
    );

    // Получаем все доступные инвентарные позиции
    const inventoryResult = await pool.query(
      `SELECT item_name FROM inventory WHERE quantity > 0`
    );

    // Добавляем кусок белого хлеба по умолчанию
    let menuItems = menuResult.rows;
    const inventoryItems = inventoryResult.rows.map(item => item.item_name.toLowerCase());
    
    // Проверяем, есть ли уже хлеб в меню
    const hasBread = menuItems.some(item => item.name.toLowerCase().includes('хлеб'));
    
    // Всегда добавляем кусок белого хлеба по умолчанию
    if (!hasBread) {
      menuItems = [...menuItems, {
        id: 0,
        meal_type: 'bread',
        name: 'Кусок белого хлеба',
        description: 'Стандартный кусок белого хлеба',
        price: 0,
        allergens: 'Глютен',
        calories: 70,
        proteins: 2.0,
        fats: 1.0,
        carbs: 13.0,
        created_at: new Date().toISOString()
      }];
    }

    res.json(menuItems);
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

// Добавить блюдо в меню (администратор или повар)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'cook') {
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
