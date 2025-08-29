import { React, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './pages.css';

// SOLUTION: Define the style objects

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password });
      
      // SOLUTION: Get 'data' from the response object
      const data = response.data;

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        navigate('/chat');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Login failed.');
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        <div className="input-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
        {message && <p className="message">{message}</p>}
        <p className="switch-link">
          Don't have an account? <Link to="/register">Register here.</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;