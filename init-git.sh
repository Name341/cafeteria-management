#!/bin/bash

# Инициализация Git репозитория и первый коммит

echo "Инициализация Git репозитория..."

# Инициализировать git
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "chore: инициализация проекта школьной столовой

- Создана полная архитектура приложения
- Backend: Node.js + Express API
- Frontend: React приложение
- Database: PostgreSQL схема
- Docker Compose для развёртывания
- Документация и гайдлайны
- Система аутентификации с JWT"

echo ""
echo "✓ Git репозиторий инициализирован!"
echo ""
echo "Для добавления remote репозитория выполните:"
echo "  git remote add origin <your-repository-url>"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "Для запуска приложения выполните:"
echo "  docker-compose up -d"
