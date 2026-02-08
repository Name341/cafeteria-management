import React, { useState, useEffect } from 'react';
import { getExpensesReport, getNutritionReport, getRevenueReport, approvePurchaseRequest } from '../api/services';
import './StudentDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading] = useState(false);
  const [error] = useState('');
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [reportType, setReportType] = useState('expenses');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

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
      const items = response.data?.items || response.data || [];
      setPurchaseRequests(items);
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

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    setReportError('');
    setReportData(null);

    if (!reportStartDate || !reportEndDate) {
      setReportError('Пожалуйста укажите дату с и до');
      return;
    }

    if (reportEndDate < reportStartDate) {
      setReportError('Дата "до" не может быть раньше даты "с"');
      return;
    }

    setReportLoading(true);
    try {
      const response = reportType === 'expenses'
        ? await getExpensesReport(reportStartDate, reportEndDate)
        : reportType === 'nutrition'
          ? await getNutritionReport(reportStartDate, reportEndDate)
          : await getRevenueReport(reportStartDate, reportEndDate);
      setReportData(response.data || null);
    } catch (err) {
      setReportError(err.response?.data?.error || 'Ошибка при формировании отчета');
    } finally {
      setReportLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ru-RU');
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
                                onClick={() => handleApproval(req.id, 'approved')}
                              >
                                Одобрить
                              </button>
                              <button
                                className="submit-btn"
                                onClick={() => handleApproval(req.id, 'rejected')}
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
                               req.status === 'rejected' ? 'rejected' :
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
                        <form className="reports-form" onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>Тип отчета:</label>
                <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                  <option value="expenses">Отчет по затратам</option>
                  <option value="nutrition">Отчет по питанию</option>
                  <option value="revenue">{'\u041e\u0442\u0447\u0435\u0442 \u043f\u043e \u0432\u044b\u0440\u0443\u0447\u043a\u0435'}</option>
                </select>
              </div>
              <div className="form-group">
                <label>Дата с:</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(event) => setReportStartDate(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Дата по:</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(event) => setReportEndDate(event.target.value)}
                />
              </div>
              <button className="submit-btn" type="submit">Сформировать отчет</button>
            </form>
            <div className="reports-list">
              <h3>Сформированный отчет:</h3>
              {reportError && <div className="error-message">{reportError}</div>}
              {reportLoading ? (
                <div className="loading">Загрузка...</div>
              ) : reportData ? (
                <>
                  {reportType === 'expenses' ? (
                    <>
                      <p className="no-items">
                        Итого заявок: {reportData.totals?.total_requests || 0} ·
                        Сумма затрат: {reportData.totals?.total_cost || 0} ₽
                      </p>
                      {reportData.items?.length ? (
                        <div className="requests-table">
                          {reportData.items.map((item) => (
                            <div className="request-item" key={item.id}>
                              <div className="request-name">{item.item_name}</div>
                              <div className="request-meta">
                                {item.quantity} · {item.unit_price} ₽ · {item.total_cost} ₽ ·
                                {item.status} · {formatDate(item.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-items">Нет данных по затратам</p>
                      )}
                    </>
                    ) : reportType === 'nutrition' ? (
                      <>
                      <p className="no-items">
                        Итого заказов: {reportData.totals?.total_orders || 0} ·
                        Порций: {reportData.totals?.total_portions || 0} ·
                        Сумма: {reportData.totals?.total_amount || 0} ₽
                      </p>
                      {reportData.items?.length ? (
                        <div className="requests-table">
                          {reportData.items.map((item) => (
                            <div className="request-item" key={item.id}>
                              <div className="request-name">{item.name}</div>
                              <div className="request-meta">
                                {item.meal_type} ·
                                Заказов: {item.orders_count} ·
                                Порций: {item.total_portions} ·
                                Сумма: {item.total_amount} ₽
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-items">Нет данных по питанию</p>
                      )}
                    </>
                  ) : (

                      <>
                        <p className="no-items">
                          ����� ��������: {reportData.totals?.total_payments || 0} �
                          ����� �������: {reportData.totals?.total_amount || 0} ���.
                        </p>
                        {reportData.items?.length ? (
                          <div className="requests-table">
                            {reportData.items.map((item) => (
                              <div className="request-item" key={item.id}>
                                <div className="request-name">������ #{item.id}</div>
                                <div className="request-meta">
                                  {item.amount} ���. � {item.payment_type} � {item.status} � {formatDate(item.created_at)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-items">��� ������ �� �������</p>
                        )}
                      </>
                    )}
                  </>
                  ) : (

                <p className="no-items">Отчет еще не формирован</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;










