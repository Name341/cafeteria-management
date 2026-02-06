// Добавляем логирование для отладки
console.log('CookDashboard component loaded');
/* eslint-disable import/first */
import React, { useState, useEffect } from 'react';
import { getMenu, createMenuItem, createPurchaseRequest, getMyPurchaseRequests, getOrdersByDate, markOrderServed, getInventory, getAvailableItems, checkInventory, receivePurchaseRequest } from '../api/services';
import './StudentDashboard.css';

const CookDashboard = () => {
  const [activeTab, setActiveTab] = useState('served');
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orders, setOrders] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: 'Литры',
    price: '',
    description: ''
  });
  const [menuFormData, setMenuFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast',
    name: '',
    description: '',
    price: '',
    allergens: '',
    calories: '',
    proteins: '',
    fats: '',
    carbs: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMenu();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'served') {
      fetchOrdersForToday();
    }
    if (activeTab === 'inventory') {
      fetchInventoryItems();
    }
    if (activeTab === 'requests') {
      fetchMyRequests();
    }
    if (activeTab === 'menu') {
      fetchAvailableItems();
    }
  }, [activeTab]);

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
  
  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const response = await getMyPurchaseRequests();
      setMyRequests(response.data || []);
    } catch (err) {
      setRequestsError('Не удалось загрузить список заявок');
    } finally {
      setRequestsLoading(false);
    }
  };
  const handleReceiveRequest = async (requestId) => {
    try {
      await receivePurchaseRequest(requestId);
      fetchMyRequests();
      fetchInventoryItems();
        alert('\u041F\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u043F\u0440\u0438\u043D\u044F\u0442\u0430 \u0438 \u043E\u0441\u0442\u0430\u0442\u043A\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u044B');
      } catch (err) {
        const data = err.response?.data;
        const details = data ? ` (${JSON.stringify(data)})` : '';
        alert('\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u043A\u0438: ' + (data?.error || err.message) + details);
      }
  };

  const fetchOrdersForToday = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getOrdersByDate(today);
      setOrders(response.data || []);
    } catch (err) {
      setOrdersError('Не удалось загрузить заказы на сегодня');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    setInventoryLoading(true);
    setInventoryError('');
    try {
      const response = await getInventory();
      setInventoryItems(response.data || []);
    } catch (err) {
      setInventoryError('Не удалось загрузить остатки продуктов');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const response = await getAvailableItems();
      setAvailableItems(response.data || []);
    } catch (err) {
      console.error('Не удалось загрузить доступные продукты');
    }
  };

  // Проверка наличия товаров и обновление меню
  const handleCheckInventory = async () => {
    try {
      await checkInventory();
      fetchMenu(); // Обновляем меню после проверки
      fetchInventoryItems(); // Обновляем остатки
      alert('Проверка наличия выполнена. Меню обновлено.');
    } catch (err) {
      alert('Ошибка при проверке наличия товаров');
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
        <button
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          📝 Создание меню
        </button>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* ВЫДАННЫЕ БЛЮДА */}
        {activeTab === 'served' && (
          <div className="tab-content">
            <h2>📋 Учет выданных блюд</h2>
            {ordersError && <div className="error-message">{ordersError}</div>}
            {ordersLoading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="served-items">
                {orders.length === 0 ? (
                  <p className="no-items">На сегодня заказов нет</p>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div className="order-item" key={order.id}>
                        <div className="order-main">
                          <div className="order-name">{order.name}</div>
                          <div className="order-meta">
                            {order.full_name} · {order.portion_size} порц.
                          </div>
                        </div>
                        <div className="order-actions">
                          <span className="order-status">{order.status}</span>
                          {order.status === 'pending' && (
                            <button
                              className="submit-btn"
                              onClick={async () => {
                                try {
                                  await markOrderServed(order.id);
                                  fetchOrdersForToday();
                                } catch (err) {
                                  alert('Ошибка при выдаче блюда: ' + (err.response?.data?.error || err.message));
                                }
                              }}
                            >
                              Выдать
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <input
                  type="text"
                  placeholder="Например: Молоко"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Количество:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Единица измерения:</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="Литры">Литры</option>
                  <option value="Килограммы">Килограммы</option>
                  <option value="Граммы">Граммы</option>
                  <option value="Штуки">Штуки</option>
                </select>
              </div>
              <button
                className="submit-btn"
                onClick={async () => {
                  console.log('Обновить остаток button clicked');
                  // TODO: Add actual functionality for updating inventory
                }}
              >
                Обновить остаток
              </button>
              <button
                className="submit-btn"
                onClick={handleCheckInventory}
                style={{ marginLeft: '10px' }}
              >
                Проверить наличие и обновить меню
              </button>
            </div>
            <div className="inventory-list">
              <h3>Текущие остатки:</h3>
              {inventoryError && <div className="error-message">{inventoryError}</div>}
              {inventoryLoading ? (
                <div className="loading">Загрузка...</div>
              ) : (
                <>
                  {inventoryItems.length === 0 ? (
                    <p className="no-items">Список продуктов пуст</p>
                  ) : (
                    <div className="inventory-items">
                      {inventoryItems.map((item) => (
                        <div className="inventory-item" key={item.id}>
                          <div className="inventory-name">{item.item_name}</div>
                          <div className="inventory-meta">
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
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
                <input
                  type="text"
                  placeholder="Введите наименование"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Количество:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Единица:</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="Литры">Литры</option>
                  <option value="Килограммы">Килограммы</option>
                  <option value="Граммы">Граммы</option>
                  <option value="Штуки">Штуки</option>
                </select>
              </div>
              <div className="form-group">
                <label>Цена за единицу:</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  placeholder="Дополнительная информация"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button className="submit-btn" onClick={async () => {
                console.log('Отправить заявку button clicked');
                console.log('Form data:', formData);
                
                try {
                  const requestData = {
                    itemName: formData.itemName,
                    quantity: parseFloat(formData.quantity),
                    unit: formData.unit,
                    unitPrice: parseFloat(formData.price),
                    description: formData.description
                  };
                  
                  console.log('Sending request:', requestData);
                  const response = await createPurchaseRequest(requestData);
                  console.log('Request successful:', response);
                  
                  // Reset form
                  setFormData({
                    itemName: '',
                    quantity: '',
                    unit: 'Литры',
                    price: '',
                    description: ''
                  });
                  
                  // Show success message
                  alert('Заявка успешно отправлена!');
                  fetchMyRequests();
                } catch (error) {
                  console.error('Error sending request:', error);
                  alert('Ошибка при отправке заявки: ' + (error.response?.data?.message || error.message));
                }
              }}>Отправить заявку</button>
            </div>
            <div className="requests-list">
              <h3>Мои заявки:</h3>
              {requestsError && <div className="error-message">{requestsError}</div>}
              {requestsLoading ? (
                <div className="loading">Загрузка...</div>
              ) : (
                <>
                  {myRequests.length === 0 ? (
                    <p className="no-items">Заявок не найдено</p>
                  ) : (
                    <div className="requests-table">
                      {myRequests.map((req) => (
                        <div className="request-item" key={req.id}>
                          <div className="request-name">{req.item_name}</div>
                          <div className="request-meta">
                            {req.quantity} {req.unit} · {req.unit_price} ₽ · {req.status}
                          </div>
                          {req.status === 'approved' && (
                            <div className="request-actions">
                              <button
                                className="submit-btn"
                                onClick={() => handleReceiveRequest(req.id)}
                              >
                                {'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u043F\u043E\u0441\u0442\u0430\u0432\u043A\u0443'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* СОЗДАНИЕ МЕНЮ */}
        {activeTab === 'menu' && (
          <div className="tab-content">
            <h2>📝 Создание меню на день</h2>
            <div className="menu-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Дата:</label>
                  <input
                    type="date"
                    value={menuFormData.date}
                    onChange={(e) => setMenuFormData({...menuFormData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Тип приема пищи:</label>
                  <select
                    value={menuFormData.mealType}
                    onChange={(e) => setMenuFormData({...menuFormData, mealType: e.target.value})}
                  >
                    <option value="breakfast">Завтрак</option>
                    <option value="lunch">Обед</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Название блюда:</label>
                <input
                  type="text"
                  placeholder="Например: Овсяная каша"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  placeholder="Состав блюда"
                  rows="3"
                  value={menuFormData.description}
                  onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Цена (₽):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({...menuFormData, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Аллергены:</label>
                  <input
                    type="text"
                    placeholder="Молоко, Глютен"
                    value={menuFormData.allergens}
                    onChange={(e) => setMenuFormData({...menuFormData, allergens: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Калории:</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={menuFormData.calories}
                    onChange={(e) => setMenuFormData({...menuFormData, calories: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Белки (г):</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={menuFormData.proteins}
                    onChange={(e) => setMenuFormData({...menuFormData, proteins: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Жиры (г):</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={menuFormData.fats}
                    onChange={(e) => setMenuFormData({...menuFormData, fats: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Углеводы (г):</label>
                  <input
                    type="number"
                    placeholder="0"
                    step="0.1"
                    value={menuFormData.carbs}
                    onChange={(e) => setMenuFormData({...menuFormData, carbs: e.target.value})}
                  />
                </div>
              </div>
              <button className="submit-btn" onClick={async () => {
                try {
                  const menuData = {
                    date: menuFormData.date,
                    mealType: menuFormData.mealType,
                    name: menuFormData.name,
                    description: menuFormData.description,
                    price: parseFloat(menuFormData.price),
                    allergens: menuFormData.allergens,
                    calories: menuFormData.calories ? parseInt(menuFormData.calories) : null,
                    proteins: menuFormData.proteins ? parseFloat(menuFormData.proteins) : null,
                    fats: menuFormData.fats ? parseFloat(menuFormData.fats) : null,
                    carbs: menuFormData.carbs ? parseFloat(menuFormData.carbs) : null
                  };
                  
                  await createMenuItem(menuData);
                  alert('Блюдо добавлено в меню!');
                  setMenuFormData({
                    date: new Date().toISOString().split('T')[0],
                    mealType: 'breakfast',
                    name: '',
                    description: '',
                    price: '',
                    allergens: '',
                    calories: '',
                    proteins: '',
                    fats: '',
                    carbs: ''
                  });
                  fetchMenu(); // Обновляем меню
                } catch (err) {
                  alert('Ошибка при добавлении блюда в меню: ' + (err.response?.data?.error || err.message));
                }
              }}>Добавить в меню</button>
            </div>
            
            <div className="available-items">
              <h3>Доступные продукты:</h3>
              {availableItems.length > 0 ? (
                <div className="items-list">
                  {availableItems.map((item) => (
                    <div key={item.id} className="item-tag">
                      {item.item_name} ({item.quantity} {item.unit})
                    </div>
                  ))}
                </div>
              ) : (
                <p>Нет доступных продуктов</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CookDashboard;





