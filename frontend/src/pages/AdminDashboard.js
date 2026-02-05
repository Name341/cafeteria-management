import React, { useState, useEffect } from 'react';
import { getExpensesReport, approvePurchaseRequest } from '../api/services';
import './StudentDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading] = useState(false);
  const [error] = useState('');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const stats = {
    totalStudents: 156,
    totalPayments: 45320,
    avgPaymentPerStudent: 290.5,
    totalOrders: 892,
    todayOrders: 45,
    lowInventoryItems: 8
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPurchaseRequests();
    }
  }, [activeTab]);

  const fetchPurchaseRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const response = await getExpensesReport();
      setPurchaseRequests(response.data || []);
    } catch (err) {
      setRequestsError('Не удалось загрузить заявки на закупку');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproval = async (requestId, approvalStatus) => {
    try {
      await approvePurchaseRequest(requestId, approvalStatus);
      fetchPurchaseRequests();
    } catch (err) {
      alert('Ошибка при изменении статуса: ' + (err.response?.data?.error || err.message));
    }
  };


  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>👨‍💼 Панель администратора</h1>
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
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Статистика
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          ✅ Заявки на закупку
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📄 Отчеты
        </button>
      </nav>

      <main className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* СТАТИСТИКА */}
        {activeTab === 'statistics' && (
          <div className="tab-content">
            <h2>📊 Статистика</h2>
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <p className="stat-label">Всего учеников</p>
                    <p className="stat-value">{stats.totalStudents}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <p className="stat-label">Всего собрано</p>
                    <p className="stat-value">{stats.totalPayments}₽</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <p className="stat-label">Среднее на ученика</p>
                    <p className="stat-value">{stats.avgPaymentPerStudent}₽</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🍽️</div>
                  <div className="stat-content">
                    <p className="stat-label">Всего заказов</p>
                    <p className="stat-value">{stats.totalOrders}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <p className="stat-label">Заказов сегодня</p>
                    <p className="stat-value">{stats.todayOrders}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-content">
                    <p className="stat-label">Товаров на заканчивается</p>
                    <p className="stat-value">{stats.lowInventoryItems}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ЗАЯВКИ НА ЗАКУПКУ */}
        {activeTab === 'requests' && (
          <div className="tab-content">
            <h2>✅ Согласование заявок на закупку</h2>
            <div className="requests-list">
              <h3>Ожидающие одобрения:</h3>
              {requestsError && <div className="error-message">{requestsError}</div>}
              {requestsLoading ? (
                <div className="loading">Загрузка...</div>
              ) : (
                <>
                  {purchaseRequests.filter((r) => r.status === 'pending').length === 0 ? (
                    <p className="no-items">Нет новых заявок</p>
                  ) : (
                    <div className="requests-table">
                      {purchaseRequests
                        .filter((r) => r.status === 'pending')
                        .map((req) => (
                          <div className="request-item" key={req.id}>
                            <div className="request-name">{req.item_name}</div>
                            <div className="request-meta">
                              {req.quantity} · {req.unit_price} ₽ · {req.total_cost} ₽
                            </div>
                            <div className="request-actions">
                              <button
                                className="submit-btn"
                                onClick={() => handleApproval(req.id, 'выполнено')}
                              >
                                Одобрить
                              </button>
                              <button
                                className="submit-btn"
                                onClick={() => handleApproval(req.id, 'отклонено')}
                              >
                                Отклонить
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="requests-history">
              <h3>История заявок:</h3>
              {requestsLoading ? (
                <div className="loading">Загрузка...</div>
              ) : (
                <>
                  {purchaseRequests.filter((r) => r.status !== 'pending').length === 0 ? (
                    <p className="no-items">История пуста</p>
                  ) : (
                    <div className="requests-table">
                      {purchaseRequests
                        .filter((r) => r.status !== 'pending')
                        .map((req) => (
                          <div className="request-item" key={req.id}>
                            <div className="request-name">{req.item_name}</div>
                            <div className="request-meta">
                              {req.quantity} · {req.unit_price} ₽ · {req.total_cost} ₽ ·
                              {req.status === 'approved' ? 'одобрено' :
                               req.status === 'rejected' ? 'отклонено' :
                               req.status === 'pending' ? 'ожидает' :
                               req.status}
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

        {/* ОТЧЕТЫ */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <h2>📄 Формирование отчетов</h2>
            <div className="reports-form">
              <div className="form-group">
                <label>Тип отчета:</label>
                <select>
                  <option>Отчет по оплатам</option>
                  <option>Отчет по посещаемости</option>
                  <option>Отчет по затратам</option>
                  <option>Отчет по питанию</option>
                </select>
              </div>
              <div className="form-group">
                <label>Период:</label>
                <select>
                  <option>День</option>
                  <option>Неделя</option>
                  <option>Месяц</option>
                  <option>Год</option>
                </select>
              </div>
              <button className="submit-btn">Сформировать отчет</button>
            </div>
            <div className="reports-list">
              <h3>Сгенерированные отчеты:</h3>
              <p className="no-items">Отчетов не найдено</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
