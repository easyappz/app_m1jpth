import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMessages, createMessage } from '../../api/messages';
import { logout } from '../../api/auth';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await getMessages(50, 0);
      setMessages(data.results || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Ошибка при загрузке сообщений');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await createMessage(newMessage.trim());
      setNewMessage('');
      await fetchMessages();
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Ошибка при отправке сообщения');
      }
    } finally {
      setSending(false);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ч. назад`;

    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-container" data-easytag="id3-src/components/Chat/index.jsx">
      <header className="chat-header">
        <h1>Групповой чат</h1>
        <div className="chat-header-actions">
          <Link to="/profile" className="chat-header-link">
            Профиль
          </Link>
          <button onClick={handleLogout} className="chat-header-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Выход
          </button>
        </div>
      </header>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Загрузка сообщений...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">Пока нет сообщений. Начните общение!</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="chat-message">
              <div className="chat-message-header">
                <span className="chat-message-author">
                  {message.author?.username || 'Аноним'}
                </span>
                <span className="chat-message-time">
                  {formatDate(message.created_at)}
                </span>
              </div>
              <div className="chat-message-content">{message.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input"
            maxLength={5000}
            disabled={sending}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
