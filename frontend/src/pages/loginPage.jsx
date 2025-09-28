// frontend/src/pages/loginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticate, confirmMfa } from '../services/cognito';
import './pages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [message, setMessage] = useState('');
  const [mfaUser, setMfaUser] = useState(null); // Holds Cognito user for MFA
  const navigate = useNavigate();

  // Handle initial login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const result = await authenticate(email, password);

      if (result.session) {
        // Login successful
        const token = result.session.idToken;
        localStorage.setItem('token', token);
        navigate('/chat');
      } else if (result.mfaUser) {
        // MFA required
        setMfaUser(result.mfaUser);
        setMessage('MFA code required. Check your authenticator app.');
      }
    } catch (error) {
      setMessage(error.message || 'Login failed.');
    }
  };

  // Handle MFA submission
  const handleMfaConfirmation = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const result = await confirmMfa(mfaUser, mfaCode);
      const token = result.idToken;

      localStorage.setItem('token', token);
      navigate('/chat');
    } catch (error) {
      setMessage(error.message || 'MFA confirmation failed.');
    }
  };

  // Render MFA form if required
  if (mfaUser) {
    return (
      <div className="auth-container">
        <form onSubmit={handleMfaConfirmation} className="auth-form">
          <h2>Enter MFA Code</h2>
          <p>Please enter the code from your authenticator app.</p>
          <div className="input-group">
            <label>MFA Code:</label>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Confirm</button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    );
  }

  // Default login form
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
