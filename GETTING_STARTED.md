# Getting Started Guide / Руководство по запуску

## English 🇬🇧

### Prerequisites
- Docker and Docker Compose installed
- Git
- Modern web browser

### Quick Start (3 steps)

1. **Clone/Navigate to project directory**
   ```bash
   cd project
   ```

2. **Copy environment configuration**
   ```bash
   cp .env.example .env
   ```

3. **Launch the application**
   ```bash
   docker-compose up -d
   ```

### Access the application
- **Web App**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Database**: localhost:5432

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | student@school.com | password |
| Cook | cook@school.com | password |
| Admin | admin@school.com | password |

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Clear all data
docker-compose down -v
```

### Documentation
- [README](README.md) - Project overview
- [API Documentation](API_DOCUMENTATION.md) - Full API reference
- [Installation Guide](INSTALLATION.md) - Detailed setup
- [Architecture](ARCHITECTURE.md) - System design
- [Quick Start](QUICK_START.md) - Common commands

---

## Русский 🇷🇺

### Требования
- Docker и Docker Compose установлены
- Git
- Современный веб-браузер

### Быстрый старт (3 шага)

1. **Перейдите в директорию проекта**
   ```bash
   cd project
   ```

2. **Скопируйте переменные окружения**
   ```bash
   cp .env.example .env
   ```

3. **Запустите приложение**
   ```bash
   docker-compose up -d
   ```

### Откройте приложение
- **Веб-приложение**: http://localhost:3000
- **API**: http://localhost:5000/api
- **База данных**: localhost:5432

### Тестовые учетные данные
| Роль | Email | Пароль |
|------|-------|--------|
| Ученик | student@school.com | password |
| Повар | cook@school.com | password |
| Администратор | admin@school.com | password |

### Полезные команды
```bash
# Просмотр логов
docker-compose logs -f

# Остановка приложения
docker-compose down

# Удалить все данные
docker-compose down -v

# Перезагрузить приложение
docker-compose restart

# Пересоздать контейнеры
docker-compose up -d --force-recreate
```

### Документация
- [README](README.md) - Описание проекта
- [Документация API](API_DOCUMENTATION.md) - Все endpoint'ы
- [Установка](INSTALLATION.md) - Подробное руководство
- [Архитектура](ARCHITECTURE.md) - Дизайн системы
- [Быстрый старт](QUICK_START.md) - Часто используемые команды

---

## Troubleshooting / Решение проблем

### Problem: Port already in use / Проблема: Порт уже используется

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Problem: Database not initializing / Проблема: БД не инициализируется

**Solution:**
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Problem: Cannot connect to API / Проблема: Не подключается к API

**Solution:**
```bash
# Check if API is running
curl http://localhost:5000/api/health

# View logs
docker-compose logs backend
```

### Problem: Dependencies not installed / Проблема: Зависимости не установлены

**Solution:**
```bash
# Clear cache and rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## Architecture Overview / Обзор архитектуры

```
┌─────────────────────────────┐
│   Frontend (React)          │
│  http://localhost:3000      │
└──────────────┬──────────────┘
               │
               │ HTTP/HTTPS
               │
┌──────────────▼──────────────┐
│   Backend (Express.js)      │
│  http://localhost:5000/api  │
│                             │
│  Authentication, Business   │
│  Logic, API Endpoints       │
└──────────────┬──────────────┘
               │
               │ SQL
               │
┌──────────────▼──────────────┐
│   Database (PostgreSQL)     │
│     localhost:5432          │
│                             │
│  users, menu, orders,       │
│  payments, reviews, etc.    │
└─────────────────────────────┘
```

---

## Features / Функции

### Student / Ученик
- ✅ Sign up and login / Регистрация и вход
- ✅ View breakfast and lunch menus / Просмотр меню
- ✅ Order meals / Заказать питание
- ✅ Mark meals as received / Отметить получение
- ✅ Leave reviews and ratings / Оставить отзыв
- ✅ Manage allergies and preferences / Указать аллергии

### Cook / Повар
- ✅ Login to system / Вход в систему
- ✅ View today's orders / Просмотр заказов
- ✅ Manage inventory / Управление остатками
- ✅ Create purchase requests / Создать заявку на закупку

### Admin / Администратор
- ✅ View payment statistics / Статистика платежей
- ✅ View attendance / Статистика посещаемости
- ✅ Approve purchase requests / Согласовать заявки
- ✅ Generate reports / Создать отчеты
- ✅ Manage users / Управление пользователями

---

## API Endpoints / API Endpoints

### Authentication / Аутентификация
- `POST /api/auth/register` - Register / Регистрация
- `POST /api/auth/login` - Login / Вход
- `GET /api/auth/profile` - Get profile / Получить профиль
- `PUT /api/auth/profile` - Update profile / Обновить профиль

### Menu / Меню
- `GET /api/menu/:date` - Get menu for date / Получить меню на дату
- `GET /api/menu/month/:year/:month` - Get monthly menu / Меню на месяц

### Orders / Заказы
- `POST /api/orders` - Create order / Создать заказ
- `GET /api/orders/my-orders` - Get my orders / Мои заказы
- `PUT /api/orders/:id/mark-received` - Mark as received / Отметить получение

### Full API docs / Полная документация API
See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## Support / Поддержка

### Documentation / Документация
- 📖 [README.md](README.md)
- 🔧 [Installation Guide](INSTALLATION.md)
- 📋 [API Reference](API_DOCUMENTATION.md)
- 🏗️ [Architecture](ARCHITECTURE.md)

### Development / Разработка
- 📝 [Contributing Guidelines](CONTRIBUTING.md)
- ⚡ [Quick Commands](QUICK_START.md)
- 📊 [Project Status](PROJECT_STATUS.md)

---

## Next Steps / Следующие шаги

1. **Start the application** / Запустите приложение
   ```bash
   docker-compose up -d
   ```

2. **Open in browser** / Откройте в браузере
   ```
   http://localhost:3000
   ```

3. **Login with test credentials** / Войдите с тестовыми учетными данными
   ```
   Email: student@school.com
   Password: password
   ```

4. **Explore the app** / Исследуйте приложение

5. **Read the documentation** / Прочитайте документацию

---

## License / Лицензия

MIT License - Free to use / Свободно используйте

---

**Happy coding! / Приятной разработки!** 🚀
