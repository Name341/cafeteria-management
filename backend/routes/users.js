const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Специальные пароли для регистрации повара и админа
const SPECIAL_PASSWORDS = {
  cook: 'fde3HHy923y4',
  admin: '4jKEIujvh495juexG9i'
};

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'student' } = req.body;
    const specialPassword = (req.body.specialPassword || '').trim();

    // Валидация входных данных
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Необходимы все поля' });
    }

    // Проверка специального пароля для повара и админа
    if ((role === 'cook' || role === 'admin') && specialPassword !== SPECIAL_PASSWORDS[role]) {
      return res.status(403).json({ error: `Неверный специальный пароль для ${role === 'cook' ? 'повара' : 'администратора'}` });
    }

    // Проверка валидности роли
    const validRoles = ['student', 'cook', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    // Проверка, что пользователь не существует
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
        const result = await pool.query(
          'INSERT INTO users (email, password, full_name, role, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, balance',
          [email, hashedPassword, fullName, role, 0.00]
        );

    const user = result.rows[0];

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.SECRET_KEY || 'default_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Авторизация
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Поиск пользователя
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const user = result.rows[0];

    // Проверка пароля
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.SECRET_KEY || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Успешно авторизованы',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
});

// Получение профиля
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, allergies, preferences, balance FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      error: 'Ошибка при получении профиля',
      details: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

// Обновление профиля
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, allergies, preferences } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, allergies = $2, preferences = $3 WHERE id = $4 RETURNING id, email, full_name, allergies, preferences, balance',
      [fullName, allergies, preferences, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      message: 'Профиль обновлен',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        full_name: result.rows[0].full_name,
        allergies: result.rows[0].allergies,
        preferences: result.rows[0].preferences,
        balance: result.rows[0].balance
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
