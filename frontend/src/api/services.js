import api from './axios';

// Регистрация
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// Вход
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

// Получить профиль
export const getProfile = () => {
  return api.get('/auth/profile');
};

// Обновить профиль
export const updateProfile = (userData) => {
  return api.put('/auth/profile', userData);
};

// Получить меню на дату
export const getMenu = (date) => {
  return api.get(`/menu/${date}`);
};

// Получить меню за месяц
export const getMonthlyMenu = (year, month) => {
  return api.get(`/menu/month/${year}/${month}`);
};

// Создать заказ
export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

// Отметить получение
export const markOrderReceived = (orderId) => {
  return api.put(`/orders/${orderId}/mark-received`);
};

// Получить свои заказы
export const getMyOrders = () => {
  return api.get('/orders/my-orders');
};

// Создать платеж
export const createPayment = (paymentData) => {
  return api.post('/payments', paymentData);
};

// Получить историю платежей
export const getPaymentHistory = () => {
  return api.get('/payments/history');
};

// Добавить отзыв
export const addReview = (reviewData) => {
  return api.post('/reviews', reviewData);
};

// Получить отзывы по блюду
export const getReviews = (mealId) => {
  return api.get(`/reviews/meal/${mealId}`);
};

// Получить среднюю оценку
export const getAverageRating = (mealId) => {
  return api.get(`/reviews/average/${mealId}`);
};

// Статистика (администратор)
export const getStatistics = () => {
  return api.get('/admin/statistics');
};

// Отчет по затратам (администратор)
export const getExpensesReport = () => {
  return api.get('/admin/expenses-report');
};

// Создать заявку на закупку (повар)
export const createPurchaseRequest = (requestData) => {
  return api.post('/purchases', requestData);
};

// Получить свои заявки (повар)
export const getMyPurchaseRequests = () => {
  return api.get('/purchases/my-requests');
};

// Получить инвентарь (повар)
export const getInventory = () => {
  return api.get('/purchases/inventory');
};

// Обновить остатки (повар)
export const updateInventory = (itemId, quantity) => {
  return api.put(`/purchases/inventory/${itemId}`, { quantity });
};
