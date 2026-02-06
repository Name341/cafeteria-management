-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'cook', 'admin')),
  allergies TEXT,
  preferences TEXT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица меню
CREATE TABLE IF NOT EXISTS menu (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  allergens TEXT,
  calories INT,
  proteins DECIMAL(5, 2),
  fats DECIMAL(5, 2),
  carbs DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('one-time', 'subscription')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id INT NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  portion_size INT DEFAULT 1,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'received', 'cancelled')) DEFAULT 'pending',
  received_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_id INT NOT NULL REFERENCES menu(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок на закупки
CREATE TABLE IF NOT EXISTS purchase_requests (
  id SERIAL PRIMARY KEY,
  cook_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'received')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица инвентаря
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL UNIQUE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  minimum_threshold DECIMAL(10, 2),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица отзывов по остаткам (продуктам)
CREATE TABLE IF NOT EXISTS inventory_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_menu_date ON menu(date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_meal_id ON reviews(meal_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reviews_inventory_id ON inventory_reviews(inventory_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_cook_id ON purchase_requests(cook_id);

-- Вставка тестовых данных
INSERT INTO users (email, password, full_name, role) VALUES
  ('admin@school.com', '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu', 'Администратор', 'admin'),
  ('cook@school.com', '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu', 'Иван Повар', 'cook'),
  ('student@school.com', '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu', 'Петр Ученик', 'student')
ON CONFLICT DO NOTHING;
