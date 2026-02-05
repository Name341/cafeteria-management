import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/services';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      
      // Сохранить токен
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Перенаправить в зависимости от роли
      setTimeout(() => {
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else if (response.data.user.role === 'cook') {
          navigate('/cook');
        } else {
          navigate('/student');
        }
      }, 100);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Столовая</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
        <p className="test-credentials">
          Тестовые учетные данные:<br/>
          Email: student@school.com<br/>
          Пароль: password
        </p>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
