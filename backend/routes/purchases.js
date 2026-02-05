const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Создать заявку на закупку (повар)
router.post('/', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const { itemName, quantity, unit, unitPrice, description } = req.body;

    if (!itemName || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Необходимы название, количество и цена' });
    }

    const totalCost = quantity * unitPrice;

    const result = await pool.query(
      `INSERT INTO purchase_requests (cook_id, item_name, quantity, unit, unit_price, total_cost, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       RETURNING *`,
      [req.user.id, itemName, quantity, unit, unitPrice, totalCost, description || null]
    );

    res.status(201).json({
      message: 'Заявка на закупку создана',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
});

// Получить свои заявки (повар)
router.get('/my-requests', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, item_name, quantity, unit, unit_price, total_cost, status, created_at
       FROM purchase_requests 
       WHERE cook_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Получить остатки продуктов (повар)
router.get('/inventory', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, item_name, quantity, unit, last_updated, minimum_threshold
       FROM inventory
       ORDER BY item_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения остатков:', error);
    res.status(500).json({ error: 'Ошибка при получении остатков' });
  }
});


// Получить доступные продукты для меню (повар)
router.get('/available-items', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, item_name, quantity, unit
       FROM inventory
       WHERE quantity > 0
       ORDER BY item_name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения доступных продуктов:', error);
    res.status(500).json({ error: 'Ошибка при получении доступных продуктов' });
  }
});

// Обновить остатки (повар)
router.put('/inventory/:itemId', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Недействительное количество' });
    }

    const result = await pool.query(
      `UPDATE inventory
       SET quantity = $1, last_updated = NOW()
       WHERE id = $2
       RETURNING *`,
      [quantity, itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    res.json({
      message: 'Остаток обновлен',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка обновления остатка:', error);
    res.status(500).json({ error: 'Ошибка при обновлении остатка' });
  }
});

// Триггер для проверки наличия товаров и обновления меню
router.post('/check-inventory', authenticateToken, authorizeRole('cook'), async (req, res) => {
  try {
    // Получаем все блюда из меню
    const menuItems = await pool.query(
      `SELECT m.id, m.name
       FROM menu m
       LEFT JOIN inventory i ON LOWER(m.name) = LOWER(i.item_name)
       WHERE i.quantity = 0`
    );

    // Удаляем блюда, ингредиенты которых закончились
    if (menuItems.rows.length > 0) {
      const menuItemIds = menuItems.rows.map(item => item.id);
      await pool.query(
        `DELETE FROM menu WHERE id = ANY($1)`,
        [menuItemIds]
      );
    }

    res.json({
      message: 'Проверка наличия выполнена',
      removedItems: menuItems.rows.length
    });
  } catch (error) {
    console.error('Ошибка проверки наличия:', error);
    res.status(500).json({ error: 'Ошибка при проверке наличия' });
  }
});

module.exports = router;
