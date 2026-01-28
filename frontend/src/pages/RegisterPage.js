import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/services';
import './LoginPage.css';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [specialPassword, setSpecialPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const SPECIAL_PASSWORDS = {
    cook: 'fde3HHy923y4',
    admin: '4jKEIujvh495juexG9i'
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Все поля обязательны');
      return false;
    }

    if ((role === 'cook' || role === 'admin') && !specialPassword) {
      setError(`Специальный пароль обязателен для регистрации ${role === 'cook' ? 'повара' : 'администратора'}`);
      return false;
    }

    if ((role === 'cook' || role === 'admin') && specialPassword !== SPECIAL_PASSWORDS[role]) {
      setError(`Неверный специальный пароль для ${role === 'cook' ? 'повара' : 'администратора'}`);
      return false;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        email,
        password,
        fullName,
        role
      });

      setSuccess('Регистрация успешна! Перенаправление...');
      
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
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Регистрация</h1>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Роль:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="student">Ученик</option>
              <option value="cook">Повар</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          {(role === 'cook' || role === 'admin') && (
            <div className="form-group">
              <label>Специальный пароль:</label>
              <input
                type="password"
                value={specialPassword}
                onChange={(e) => setSpecialPassword(e.target.value)}
                placeholder="Введите специальный пароль"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>ФИ (Полное имя):</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Петров"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@school.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
            />
          </div>
          <div className="form-group">
            <label>Подтвердить пароль:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
