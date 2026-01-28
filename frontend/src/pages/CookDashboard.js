import React, { useState, useEffect } from 'react';
import { getMenu } from '../api/services';
import './StudentDashboard.css';

const CookDashboard = () => {
  const [activeTab, setActiveTab] = useState('served');
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await getMenu(new Date().toISOString().split('T')[0]);
      setMenu(response.data);
    } catch (err) {
      setError('Не удалось загрузить меню');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>👨‍🍳 Панель повара</h1>
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
          className={`tab ${activeTab === 'served' ? 'active' : ''}`}
          onClick={() => setActiveTab('served')}
        >
          📋 Выданные блюда
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Остатки продуктов
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          🛒 Заявки на закупку
        </button>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* ВЫДАННЫЕ БЛЮДА */}
        {activeTab === 'served' && (
          <div className="tab-content">
            <h2>📋 Учет выданных блюд</h2>
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="served-items">
                <p className="no-items">Сегодня еще нет выданных блюд</p>
              </div>
            )}
          </div>
        )}

        {/* ОСТАТКИ ПРОДУКТОВ */}
        {activeTab === 'inventory' && (
          <div className="tab-content">
            <h2>📦 Контроль остатков продуктов</h2>
            <div className="inventory-form">
              <div className="form-group">
                <label>Название продукта:</label>
                <input type="text" placeholder="Например: Молоко" />
              </div>
              <div className="form-group">
                <label>Количество:</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Единица измерения:</label>
                <select>
                  <option>Литры</option>
                  <option>Килограммы</option>
                  <option>Граммы</option>
                  <option>Штуки</option>
                </select>
              </div>
              <button className="submit-btn">Обновить остаток</button>
            </div>
            <div className="inventory-list">
              <h3>Текущие остатки:</h3>
              <p className="no-items">Список продуктов пуст</p>
            </div>
          </div>
        )}

        {/* ЗАЯВКИ НА ЗАКУПКУ */}
        {activeTab === 'requests' && (
          <div className="tab-content">
            <h2>🛒 Внесение заявок на закупку</h2>
            <div className="purchase-form">
              <div className="form-group">
                <label>Наименование товара:</label>
                <input type="text" placeholder="Введите наименование" />
              </div>
              <div className="form-group">
                <label>Количество:</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Единица:</label>
                <select>
                  <option>Литры</option>
                  <option>Килограммы</option>
                  <option>Граммы</option>
                  <option>Штуки</option>
                </select>
              </div>
              <div className="form-group">
                <label>Цена за единицу:</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Описание:</label>
                <textarea placeholder="Дополнительная информация" rows="3" />
              </div>
              <button className="submit-btn">Отправить заявку</button>
            </div>
            <div className="requests-list">
              <h3>Мои заявки:</h3>
              <p className="no-items">Заявок не найдено</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CookDashboard;
