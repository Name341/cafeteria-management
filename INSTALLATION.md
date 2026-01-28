# Руководство по установке и развёртыванию

## Быстрый старт с Docker Compose

### Требования
- Docker (версия 20.10+)
- Docker Compose (версия 1.29+)
- Git

### Шаги установки

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd project
```

2. **Создайте файл переменных окружения:**
```bash
cp .env.example .env
```

3. **Обновите переменные окружения (опционально):**
   - Отредактируйте `.env` и измените пароли и секретные ключи
   - Рекомендуется использовать сильные пароли для продакшена

4. **Запустите приложение:**
```bash
docker-compose up -d
```

5. **Подождите инициализации базы данных (около 30 секунд)**

6. **Откройте приложение:**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api/health
   - Database: localhost:5432

### Тестовые учетные данные

После инициализации базы данных доступны следующие тестовые аккаунты:

**Администратор:**
- Email: admin@school.com
- Пароль: password
- Роль: admin

**Повар:**
- Email: cook@school.com
- Пароль: password
- Роль: cook

**Ученик:**
- Email: student@school.com
- Пароль: password
- Роль: student

> **Важно:** Измените пароли для всех учетных записей в продакшене!

## Локальная разработка

### Backend

1. **Перейдите в директорию backend:**
```bash
cd backend
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Создайте файл .env:**
```bash
cp ../.env.example .env
```

4. **Убедитесь, что PostgreSQL запущен локально (или используйте docker):**
```bash
docker run -d -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cafeteria_db -p 5432:5432 postgres:15-alpine
```

5. **Запустите сервер в режиме разработки:**
```bash
npm run dev
```

Сервер запустится на http://localhost:5000

### Frontend

1. **Перейдите в директорию frontend:**
```bash
cd frontend
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Запустите приложение в режиме разработки:**
```bash
npm start
```

Приложение откроется на http://localhost:3000

## Остановка приложения

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить данные
docker-compose down -v
```

## Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Управление базой данных

### Получение доступа к PostgreSQL

```bash
docker-compose exec db psql -U cafeteria_user -d cafeteria_db
```

### Выполнение миграций вручную

```bash
# Скопировать схему в базу
docker-compose exec db psql -U cafeteria_user -d cafeteria_db -f /docker-entrypoint-initdb.d/01-schema.sql
```

## Возможные проблемы

### Ошибка "Порт уже используется"

```bash
# Измените порты в docker-compose.yml или
lsof -i :5000  # Найдите процесс
kill -9 <PID>   # Завершите процесс
```

### Базы данных не инициализируется

```bash
# Пересоздайте контейнер с удалением данных
docker-compose down -v
docker-compose up -d
```

### Backend не может подключиться к БД

```bash
# Проверьте логи
docker-compose logs db

# Убедитесь, что БД инициализировалась
docker-compose exec db pg_isready -U cafeteria_user
```

## Переменные окружения

Основные переменные в `.env`:

- `POSTGRES_USER` - имя пользователя БД
- `POSTGRES_PASSWORD` - пароль БД
- `POSTGRES_DB` - имя базы данных
- `NODE_ENV` - окружение (development/production)
- `PORT` - порт backend сервера
- `SECRET_KEY` - секретный ключ для JWT

## Развёртывание на продакшене

1. Обновите переменные окружения в `.env` с безопасными значениями
2. Используйте reverse proxy (nginx) перед приложением
3. Включите HTTPS
4. Регулярно делайте резервные копии БД
5. Установите мониторинг и логирование

```bash
# Запуск в режиме продакшена
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Резервное копирование БД

```bash
# Создать резервную копию
docker-compose exec db pg_dump -U cafeteria_user cafeteria_db > backup.sql

# Восстановить из резервной копии
docker-compose exec -T db psql -U cafeteria_user cafeteria_db < backup.sql
```

## Дополнительная информация

- [Документация Express.js](https://expressjs.com/)
- [Документация React](https://react.dev/)
- [Документация PostgreSQL](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
