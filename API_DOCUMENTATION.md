# API Документация

## Базовая информация

**Base URL:** `http://localhost:5000/api`

**Аутентификация:** JWT токен в заголовке `Authorization: Bearer <token>`

## Аутентификация

### Регистрация
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Иван Иванов",
  "role": "student"  // 'student', 'cook', 'admin'
}

Ответ 201:
{
  "message": "Пользователь успешно зарегистрирован",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Иван Иванов",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Авторизация
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Ответ 200:
{
  "message": "Успешно авторизованы",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Иван Иванов",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Получить профиль
```
GET /auth/profile
Authorization: Bearer <token>

Ответ 200:
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Иван Иванов",
  "role": "student",
  "allergies": "арахис",
  "preferences": "без глютена"
}
```

### Обновить профиль
```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Новое имя",
  "allergies": "арахис, молоко",
  "preferences": "вегетарианское"
}

Ответ 200:
{
  "message": "Профиль обновлен",
  "user": { ... }
}
```

## Меню

### Получить меню на дату
```
GET /menu/:date
Пример: /menu/2024-01-15

Ответ 200:
[
  {
    "id": 1,
    "meal_type": "breakfast",
    "name": "Каша овсяная",
    "description": "С молоком и ягодами",
    "price": 45.50,
    "allergens": "глютен, молоко",
    "calories": 320,
    "proteins": 12,
    "fats": 8,
    "carbs": 48,
    "created_at": "2024-01-15T10:00:00Z"
  },
  ...
]
```

### Получить меню за месяц
```
GET /menu/month/:year/:month
Пример: /menu/month/2024/01

Ответ 200:
[
  {
    "id": 1,
    "date": "2024-01-15",
    "meal_type": "breakfast",
    "name": "Каша овсяная",
    "price": 45.50
  },
  ...
]
```

### Добавить блюдо (только администратор)
```
POST /menu
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "date": "2024-01-20",
  "mealType": "breakfast",
  "name": "Каша гречневая",
  "description": "С маслом сливочным",
  "price": 50,
  "allergens": "глютен",
  "calories": 350,
  "proteins": 13,
  "fats": 10,
  "carbs": 52
}

Ответ 201:
{
  "message": "Блюдо добавлено в меню",
  "dish": { ... }
}
```

## Заказы

### Создать заказ (ученик)
```
POST /orders
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "mealId": 1,
  "date": "2024-01-15",
  "portionSize": 1
}

Ответ 201:
{
  "message": "Заказ создан",
  "order": {
    "id": 1,
    "user_id": 1,
    "meal_id": 1,
    "order_date": "2024-01-15",
    "portion_size": 1,
    "status": "pending"
  }
}
```

### Отметить получение питания
```
PUT /orders/:orderId/mark-received
Authorization: Bearer <student_token>

Ответ 200:
{
  "message": "Получение питания отмечено",
  "order": {
    "id": 1,
    "status": "received",
    "received_at": "2024-01-15T12:30:00Z"
  }
}
```

### Получить свои заказы (ученик)
```
GET /orders/my-orders
Authorization: Bearer <student_token>

Ответ 200:
[
  {
    "id": 1,
    "meal_id": 1,
    "name": "Каша овсяная",
    "description": "С молоком и ягодами",
    "order_date": "2024-01-15",
    "status": "received",
    "received_at": "2024-01-15T12:30:00Z"
  },
  ...
]
```

### Получить заказы на дату (повар)
```
GET /orders/date/:date
Authorization: Bearer <cook_token>
Пример: /orders/date/2024-01-15

Ответ 200:
[
  {
    "id": 1,
    "user_id": 1,
    "full_name": "Петр Ученик",
    "name": "Каша овсяная",
    "description": "С молоком и ягодами",
    "portion_size": 1,
    "status": "pending"
  },
  ...
]
```

## Платежи

### Создать платеж (ученик)
```
POST /payments
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "amount": 500,
  "paymentType": "one-time"  // или "subscription"
}

Ответ 201:
{
  "message": "Платеж создан",
  "payment": {
    "id": 1,
    "user_id": 1,
    "amount": 500,
    "payment_type": "one-time",
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Получить историю платежей (ученик)
```
GET /payments/history
Authorization: Bearer <student_token>

Ответ 200:
[
  {
    "id": 1,
    "amount": 500,
    "payment_type": "one-time",
    "status": "completed",
    "created_at": "2024-01-15T10:00:00Z"
  },
  ...
]
```

### Подтвердить платеж (администратор)
```
PUT /payments/:paymentId/confirm
Authorization: Bearer <admin_token>

Ответ 200:
{
  "message": "Платеж подтвержден",
  "payment": {
    "id": 1,
    "status": "completed",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## Отзывы

### Добавить отзыв (ученик)
```
POST /reviews
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "mealId": 1,
  "rating": 4,
  "comment": "Вкусно, но мало соли"
}

Ответ 201:
{
  "message": "Отзыв добавлен",
  "review": {
    "id": 1,
    "user_id": 1,
    "meal_id": 1,
    "rating": 4,
    "comment": "Вкусно, но мало соли",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### Получить отзывы по блюду
```
GET /reviews/meal/:mealId
Пример: /reviews/meal/1

Ответ 200:
[
  {
    "id": 1,
    "user_id": 1,
    "full_name": "Петр Ученик",
    "rating": 4,
    "comment": "Вкусно",
    "created_at": "2024-01-15T12:00:00Z"
  },
  ...
]
```

### Получить среднюю оценку
```
GET /reviews/average/:mealId
Пример: /reviews/average/1

Ответ 200:
{
  "average_rating": 4.2,
  "review_count": 5
}
```

## Покупки и инвентарь

### Создать заявку на закупку (повар)
```
POST /purchases
Authorization: Bearer <cook_token>
Content-Type: application/json

{
  "itemName": "Мука пшеничная",
  "quantity": 50,
  "unit": "кг",
  "unitPrice": 30,
  "description": "Для выпечки хлеба"
}

Ответ 201:
{
  "message": "Заявка на закупку создана",
  "request": {
    "id": 1,
    "cook_id": 2,
    "item_name": "Мука пшеничная",
    "quantity": 50,
    "unit": "кг",
    "unit_price": 30,
    "total_cost": 1500,
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Получить инвентарь (повар)
```
GET /purchases/inventory
Authorization: Bearer <cook_token>

Ответ 200:
[
  {
    "id": 1,
    "item_name": "Мука пшеничная",
    "quantity": 100,
    "unit": "кг",
    "last_updated": "2024-01-15T10:00:00Z",
    "minimum_threshold": 20
  },
  ...
]
```

### Обновить остатки (повар)
```
PUT /purchases/inventory/:itemId
Authorization: Bearer <cook_token>
Content-Type: application/json

{
  "quantity": 75
}

Ответ 200:
{
  "message": "Остаток обновлен",
  "item": {
    "id": 1,
    "quantity": 75,
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

## Администратор

### Получить статистику (администратор)
```
GET /admin/statistics
Authorization: Bearer <admin_token>

Ответ 200:
{
  "payments": {
    "total_payments": 50,
    "total_amount": 25000,
    "completed_payments": 45
  },
  "attendance": {
    "unique_students": 100,
    "total_meals_received": 250
  },
  "monthlyStatistics": [
    {
      "month": "2024-01-01",
      "meals_count": 250,
      "total_revenue": 10000
    },
    ...
  ]
}
```

### Получить отчет по затратам (администратор)
```
GET /admin/expenses-report
Authorization: Bearer <admin_token>

Ответ 200:
[
  {
    "id": 1,
    "item_name": "Мука пшеничная",
    "quantity": 50,
    "unit_price": 30,
    "total_cost": 1500,
    "status": "approved",
    "created_at": "2024-01-15T10:00:00Z"
  },
  ...
]
```

### Согласовать заявку (администратор)
```
PUT /admin/purchase-requests/:requestId/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "approvalStatus": "approved"  // или "rejected"
}

Ответ 200:
{
  "message": "Заявка одобрена",
  "request": {
    "id": 1,
    "status": "approved",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

## Коды ошибок

- `200` - OK
- `201` - Created
- `400` - Bad Request (неверные данные)
- `401` - Unauthorized (требуется аутентификация)
- `403` - Forbidden (недостаточно прав)
- `404` - Not Found (ресурс не найден)
- `409` - Conflict (конфликт, например пользователь уже существует)
- `500` - Internal Server Error (ошибка сервера)

## Health Check

```
GET /api/health

Ответ 200:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00Z"
}
```
