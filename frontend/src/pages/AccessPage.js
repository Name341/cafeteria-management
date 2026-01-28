import React, { useState } from 'react';
import './LoginPage.css';

const AccessPage = ({ onAccessGranted }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Установите свой пароль здесь
    const correctPassword = 'cafeteria2024';
    
    if (password === correctPassword) {
      localStorage.setItem('accessGranted', 'true');
      onAccessGranted();
    } else {
      setError('Неверный пароль');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 Доступ к приложению</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Введите пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn">Войти</button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
          Попросите пароль у администратора
        </p>
      </div>
    </div>
  );
};

export default AccessPage;
