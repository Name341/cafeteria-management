-- Вставка аккаунта повара
INSERT INTO users (email, password, full_name, role) VALUES 
  ('powar@mail.ru', '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu', 'Повар', 'cook')
ON CONFLICT (email) DO UPDATE SET 
  password = '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu',
  full_name = 'Повар',
  role = 'cook';

-- Вставка аккаунта администратора
INSERT INTO users (email, password, full_name, role) VALUES 
  ('admin@school.ru', '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu', 'Администратор', 'admin')
ON CONFLICT (email) DO UPDATE SET 
  password = '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu',
  full_name = 'Администратор',
  role = 'admin';
