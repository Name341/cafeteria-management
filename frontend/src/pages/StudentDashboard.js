import React, { useState, useEffect } from 'react';
import { getMenu, createOrder, getMyOrders, createPayment, getProfile, updateProfile, addReview, getInventoryReviewItems, addInventoryReview } from '../api/services';
import './StudentDashboard.css';

const getLocalISODate = () => {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().split('T')[0];
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalISODate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Профиль
  const [profile, setProfile] = useState({});
  const [editProfile, setEditProfile] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [preferences, setPreferences] = useState('');

  // Платежи
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('one-time');

  // Отзывы
  const [reviewMealId, setReviewMealId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewItems, setReviewItems] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenu();
    } else if (activeTab === 'orders') {
      fetchMyOrders();
    } else if (activeTab === 'profile') {
      fetchProfile();
    } else if (activeTab === 'reviews') {
      fetchReviewItems();
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    if (activeTab !== 'reviews') return undefined;
    const intervalId = setInterval(() => {
      fetchReviewItems();
    }, 20000);
    return () => clearInterval(intervalId);
  }, [activeTab, selectedDate]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await getMenu(selectedDate);
      setMenu(response.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить меню');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyOrders();
      setMyOrders(response.data);
      setError('');
    } catch (err) {
      setError('Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProfile();
      setProfile(response.data);
      setAllergies(response.data.allergies || '');
      setPreferences(response.data.preferences || '');
      setError('');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const details = data ? ` (${JSON.stringify(data)})` : '';
      setError(`Ошибка при получении профиля${status ? ` [${status}]` : ''}${details}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewItems = async () => {
    try {
      const response = await getInventoryReviewItems();
      setReviewItems(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при получении списка остатков');
    }
  };

  const handleOrder = async (mealId) => {
    const mealIdNum = Number(mealId);
    if (!Number.isInteger(mealIdNum) || mealIdNum <= 0) {
      setError('Это блюдо по умолчанию и недоступно для заказа');
      return;
    }

    try {
      const response = await createOrder({
        mealId: mealIdNum,
        date: selectedDate
      });
      
      // Если заказ создан успешно и были списаны средства
      if (response.data.deductedAmount) {
        setSuccessMessage(`Заказ создан! Списано: ${response.data.deductedAmount}₽`);
        // Обновляем баланс в профиле
        const newBalance = response.data.newBalance || ((parseFloat(profile.balance) || 0) - response.data.deductedAmount);
        setProfile(prev => ({
          ...prev,
          balance: newBalance
        }));
        // Также обновляем баланс в localStorage
        const updatedUser = {
          ...user,
          balance: newBalance
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setSuccessMessage('Заказ создан!');
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchMenu();
    } catch (err) {
      setError('Не удалось создать заказ: ' + (err.response?.data?.error || err.message));
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Введите корректную сумму');
      return;
    }
    try {
      setError('');
      const response = await createPayment({
        amount: parseFloat(paymentAmount),
        paymentType
      });
      setSuccessMessage('Платеж успешно выполнен!');
      setPaymentAmount('');
      if (response?.data?.balance !== undefined) {
        setProfile(prev => ({
          ...prev,
          balance: response.data.balance
        }));
        const updatedUser = {
          ...user,
          balance: response.data.balance
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        fetchProfile();
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при обработке платежа');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        allergies,
        preferences
      });
      setSuccessMessage('Профиль обновлен!');
      setEditProfile(false);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchProfile();
    } catch (err) {
      setError('Ошибка при обновлении профиля');
    }
  };

  const handleReview = async () => {
    const mealIdNum = Number(reviewMealId);
    const ratingNum = Number(reviewRating);
    if (!Number.isInteger(mealIdNum) || mealIdNum <= 0) {
      setError('Выберите продукт из остатков');
      return;
    }
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setError('Оценка должна быть от 1 до 5 звезд');
      return;
    }
    try {
      await addInventoryReview({
        inventoryId: mealIdNum,
        rating: ratingNum,
        comment: reviewComment
      });
      setSuccessMessage('Отзыв отправлен!');
      setReviewMealId('');
      setReviewComment('');
      setReviewRating(5);
      setTimeout(() => setSuccessMessage(''), 3000);
      setError('');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const details = data ? ` (${JSON.stringify(data)})` : '';
      setError(`Ошибка при добавлении отзыва${status ? ` [${status}]` : ''}${details}`);
    }
  };

  const breakfastItems = menu.filter(item => item.meal_type === 'breakfast');
  const lunchItems = menu.filter(item => item.meal_type === 'lunch');
  const isOrderableItem = (item) => Number(item.id) > 0;

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>🍽️ Столовая</h1>
        <div className="header-right">
          <span className="user-name">{user.fullName}</span>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }} className="logout-btn">Выход</button>
        </div>
      </header>

      <nav className="tabs-nav">
        <button 
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          📋 Меню
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Мои заказы
        </button>
        <button 
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          💳 Оплата
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Профиль
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Отзывы
        </button>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* МЕНЮ */}
        {activeTab === 'menu' && (
          <div className="tab-content">
            <div className="date-selector">
              <label>Выберите дату:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="menu-container">
                <section className="meal-section">
                  <h2>🥣 Завтраки</h2>
                  {breakfastItems.length > 0 ? (
                    <div className="meal-grid">
                      {breakfastItems.map(item => (
                        <div key={item.id} className="meal-card">
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>
                          <div className="meal-nutritions">
                            <span>Б: {item.proteins}г</span>
                            <span>Ж: {item.fats}г</span>
                            <span>У: {item.carbs}г</span>
                            <span>⚡ {item.calories} ккал</span>
                          </div>
                          {item.allergens && <p className="allergens">⚠️ Аллергены: {item.allergens}</p>}
                          <div className="meal-footer">
                            <span className="price">{item.price}₽</span>
                            <button
                              onClick={() => handleOrder(item.id)}
                              disabled={!isOrderableItem(item)}
                            >
                              {isOrderableItem(item) ? 'Заказать' : 'По умолчанию'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">Нет доступных завтраков</p>
                  )}
                </section>

                <section className="meal-section">
                  <h2>🍽️ Обеды</h2>
                  {lunchItems.length > 0 ? (
                    <div className="meal-grid">
                      {lunchItems.map(item => (
                        <div key={item.id} className="meal-card">
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>
                          <div className="meal-nutritions">
                            <span>Б: {item.proteins}г</span>
                            <span>Ж: {item.fats}г</span>
                            <span>У: {item.carbs}г</span>
                            <span>⚡ {item.calories} ккал</span>
                          </div>
                          {item.allergens && <p className="allergens">⚠️ Аллергены: {item.allergens}</p>}
                          <div className="meal-footer">
                            <span className="price">{item.price}₽</span>
                            <button
                              onClick={() => handleOrder(item.id)}
                              disabled={!isOrderableItem(item)}
                            >
                              {isOrderableItem(item) ? 'Заказать' : 'По умолчанию'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-items">Нет доступных обедов</p>
                  )}
                </section>
              </div>
            )}
          </div>
        )}

        {/* МОИ ЗАКАЗЫ */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>Мои заказы</h2>
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : myOrders.length > 0 ? (
              <div className="orders-list">
                {myOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-header">
                      <h3>{order.meal_name}</h3>
                      <span className={`status status-${order.status}`}>{order.status}</span>
                    </div>
                    <p>Дата заказа: {new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
                    <p>Дата получения: {order.order_date}</p>
                    {order.status === 'pending' && (
                      <button className="mark-received-btn">Отметить получением</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">У вас нет заказов</p>
            )}
          </div>
        )}

        {/* ОПЛАТА */}
        {activeTab === 'payment' && (
          <div className="tab-content">
            <h2>💳 Оплата питания</h2>
            <div className="payment-form">
              <div className="form-group">
                <label>Тип платежа:</label>
                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                  <option value="one-time">Разовый платеж</option>
                  <option value="subscription">Абонемент</option>
                </select>
              </div>
              <div className="form-group">
                <label>Сумма (₽):</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Введите сумму"
                  min="0"
                  step="100"
                />
              </div>
              <button onClick={handlePayment} className="pay-btn">Оплатить</button>
            </div>
            <div className="payment-info">
              <h3>ℹ️ Информация</h3>
              <p>• Разовый платеж - оплата за одноразовый заказ</p>
              <p>• Абонемент - ежемесячная подписка на питание</p>
            </div>
          </div>
        )}

        {/* ПРОФИЛЬ */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <h2>👤 Мой профиль</h2>
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="profile-section">
                <div className="profile-info">
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>ФИ:</strong> {profile.full_name}</p>
                  <p><strong>Роль:</strong> {profile.role === 'student' ? 'Ученик' : profile.role}</p>
                  <p><strong>Баланс:</strong> {profile.balance ? `${profile.balance}₽` : '0₽'}</p>
                </div>

                {editProfile ? (
                  <div className="profile-edit">
                    <div className="form-group">
                      <label>Пищевые аллергии:</label>
                      <textarea
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Укажите ваши аллергии (если есть)"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Предпочтения в пище:</label>
                      <textarea
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="Укажите ваши предпочтения (вегетарианец, без глютена и т.д.)"
                        rows="3"
                      />
                    </div>
                    <div className="button-group">
                      <button onClick={handleUpdateProfile} className="save-btn">Сохранить</button>
                      <button onClick={() => setEditProfile(false)} className="cancel-btn">Отмена</button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-view">
                    <div className="info-box">
                      <h3>Пищевые аллергии:</h3>
                      <p>{allergies || 'Не указано'}</p>
                    </div>
                    <div className="info-box">
                      <h3>Предпочтения в пище:</h3>
                      <p>{preferences || 'Не указано'}</p>
                    </div>
                    <div className="info-box">
                      <h3>Баланс:</h3>
                      <p>{profile.balance ? `${profile.balance}₽` : '0₽'}</p>
                    </div>
                    <button onClick={() => setEditProfile(true)} className="edit-btn">Редактировать</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ОТЗЫВЫ */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <h2>⭐ Оставить отзыв о блюде</h2>
              <button onClick={fetchReviewItems} className="refresh-btn">Обновить список</button>
              <div className="review-form">
                <div className="form-group">
                  <label>Выберите продукт:</label>
                  <select value={reviewMealId} onChange={(e) => setReviewMealId(e.target.value)}>
                    <option value="">-- Выберите продукт --</option>
                    {reviewItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_name || item.name}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="form-group">
                <label>Оценка: {reviewRating} звезд(а)</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star ${star <= reviewRating ? 'active' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Комментарий:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Напишите ваш комментарий"
                  rows="4"
                />
              </div>
              <button onClick={handleReview} className="submit-review-btn">Отправить отзыв</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
