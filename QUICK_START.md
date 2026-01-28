# Быстрые команды для разработки

## Запуск приложения

### С Docker Compose (рекомендуется)
```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересоздание с нуля
docker-compose down -v
docker-compose up -d
```

### Локальная разработка

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Database (Docker)
```bash
docker run -d \
  -e POSTGRES_USER=cafeteria_user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cafeteria_db \
  -p 5432:5432 \
  postgres:15-alpine
```

## Часто используемые команды

### Git
```bash
# Создать ветку
git checkout -b feat/new-feature

# Просмотр статуса
git status

# Стейджинг
git add .

# Коммит
git commit -m "feat: добавлена новая функция"

# Push
git push origin feat/new-feature

# Pull latest
git pull origin main
```

### Backend

```bash
# Установка зависимостей
npm install

# Запуск в разработке
npm run dev

# Запуск в продакшене
npm start

# Тесты
npm test
```

### Frontend

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm start

# Сборка для продакшена
npm run build

# Тесты
npm test
```

### Database

```bash
# Подключение к базе
docker-compose exec db psql -U cafeteria_user -d cafeteria_db

# Просмотр таблиц
\dt

# Выход
\q

# Резервная копия
docker-compose exec db pg_dump -U cafeteria_user cafeteria_db > backup.sql

# Восстановление
docker-compose exec -T db psql -U cafeteria_user cafeteria_db < backup.sql

# Очистка данных
docker-compose exec db psql -U cafeteria_user -d cafeteria_db -c "DROP TABLE IF EXISTS users CASCADE;"
```

### Docker

```bash
# Просмотр контейнеров
docker-compose ps

# Логи сервиса
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Выполнение команды в контейнере
docker-compose exec backend npm test
docker-compose exec db psql -U cafeteria_user -d cafeteria_db

# Пересборка образов
docker-compose build

# Удаление всех данных
docker-compose down -v
```

## Тестовые учетные данные

```
Администратор:
Email: admin@school.com
Пароль: password

Повар:
Email: cook@school.com
Пароль: password

Ученик:
Email: student@school.com
Пароль: password
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:5432
- Health check: http://localhost:5000/api/health

## Линки и ресурсы

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [JWT Introduction](https://jwt.io/introduction)

## Решение проблем

### Порт уже используется
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### PostgreSQL не инициализируется
```bash
# Удалить том и пересоздать
docker-compose down -v
docker-compose up -d
```

### Frontend не подключается к API
```bash
# Проверить, что backend запущен
curl http://localhost:5000/api/health

# Проверить CORS в backend
# Убедиться, что frontend URL добавлен в CORS_ORIGIN
```

### npm зависимости не обновляются
```bash
# Очистить кеш и переустановить
rm -rf node_modules package-lock.json
npm install

# Или в Docker
docker-compose build --no-cache
docker-compose up -d
```
