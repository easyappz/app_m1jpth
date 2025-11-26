import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, logout } from '../../api/profile';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData(data);
      setFormData({
        username: data.username || '',
        email: data.email || ''
      });
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Не удалось загрузить профиль');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const data = await updateProfile(formData);
      setProfileData(data);
      setSuccess('Профиль успешно обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(', ');
        setError(errorMessages || 'Ошибка при обновлении профиля');
      } else {
        setError('Ошибка при обновлении профиля');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id4-src/components/Profile/index.jsx">
        <div className="profile-card">
          <div className="loading">Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id4-src/components/Profile/index.jsx">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Мой профиль</h1>
          <p>Управление вашей учетной записью</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {profileData && (
          <div className="profile-info">
            <div className="profile-info-item">
              <span className="profile-info-label">Имя пользователя:</span>
              <span className="profile-info-value">{profileData.username}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Email:</span>
              <span className="profile-info-value">{profileData.email}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">ID пользователя:</span>
              <span className="profile-info-value">{profileData.id}</span>
            </div>
          </div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
          <h2>Редактировать профиль</h2>
          
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              minLength={3}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>

        <button onClick={handleLogout} className="btn btn-danger">
          Выйти из системы
        </button>

        <button onClick={handleBackToChat} className="btn btn-secondary">
          Вернуться в чат
        </button>
      </div>
    </div>
  );
};

export default Profile;
