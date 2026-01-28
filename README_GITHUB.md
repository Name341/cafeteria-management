# 🍽️ Cafeteria Management System

Веб-приложение для управления школьной столовой с поддержкой студентов, поваров и администраторов.

## 📋 Функциональность

### 👨‍🎓 Для студентов:
- 📋 Просмотр меню
- 📦 Управление заказами
- 💳 Система оплаты
- 👤 Профиль и предпочтения
- ⭐ Оставить отзыв

### 👨‍🍳 Для поваров:
- 🍽️ Учет выданных блюд
- 📊 Контроль инвентаря
- 📝 Заявки на закупку

### 👨‍💼 Для администраторов:
- 📊 Статистика и аналитика
- ✅ Согласование заявок
- 📄 Формирование отчетов

## 🛠️ Технологический стек

- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT tokens

## 🚀 Быстрый старт

### Требования:
- Docker & Docker Compose
- Node.js 18+
- PostgreSQL (или используйте Docker)

### Установка:

```bash
# Клонируйте репозиторий
git clone https://github.com/ВАШ_ЮЗЕРНЕЙМ/cafeteria-management.git
cd cafeteria-management

# Запустите через Docker Compose
docker-compose up -d --build
```

### Доступ:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## 👥 Тестовые учетные данные

| Email | Роль | Пароль |
|-------|------|--------|
| `admin@school.com` | Администратор | password |
| `cook@school.com` | Повар | password |
| `student@school.com` | Ученик | password |

## 📁 Структура проекта

```
project/
├── frontend/              # React приложение
│   ├── src/
│   │   ├── pages/        # Компоненты страниц
│   │   ├── api/          # API сервисы
│   │   └── App.js        # Основной компонент
│   └── package.json
├── backend/              # Express сервер
│   ├── routes/           # API маршруты
│   ├── server.js         # Основной сервер
│   └── package.json
├── database/
│   └── schema.sql        # SQL схема БД
└── docker-compose.yml    # Docker конфиг
```

## 🌐 Доступ с других устройств

### В локальной сети:
```
http://192.168.1.xx:3000
```

### Из интернета:
Используйте Cloudflare Tunnel или локальный IP с маршрутизацией.

## 📝 Лицензия

MIT

## 👨‍💻 Автор

Ваше имя

---

**Готово к использованию!** 🎉
