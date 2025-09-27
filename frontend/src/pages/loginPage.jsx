// frontend/src/pages/loginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticate } from '../services/cognito';
import './pages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // We now use the email to authenticate
      const session = await authenticate(email, password);
      const token = session.getIdToken().getJwtToken();
      
      if (token) {
        localStorage.setItem('token', token);
        navigate('/chat');
      }
    } catch (error) {
      setMessage(error.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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