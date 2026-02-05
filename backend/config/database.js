require('dotenv').config();
const { Pool } = require('pg');

// Проверка переменных окружения
console.log('Попытка подключения к БД с параметрами:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost');
console.log('POSTGRES_USER:', process.env.POSTGRES_USER || 'cafeteria_user');
console.log('POSTGRES_DB:', process.env.POSTGRES_DB || 'cafeteria_db');
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || 5432);

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'cafeteria_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'cafeteria_db',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Непредвиденная ошибка в пуле подключений', err);
});

module.exports = pool;
