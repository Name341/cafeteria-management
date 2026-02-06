require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const purchaseRoutes = require('./routes/purchases');

const app = express();

// Middleware безопасности
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    /^http:\/\/192\.168\..*:\d+$/
  ],
  credentials: true
}));

// Логирование запросов
app.use(morgan('combined'));

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
app.use('/api/auth', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/purchases', purchaseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка глобальных ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
