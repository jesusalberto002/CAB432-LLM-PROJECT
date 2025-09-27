// frontend/src/pages/loginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authenticate, confirmMfa } from '../services/cognito'; // Import confirmMfa
import './pages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [message, setMessage] = useState('');
  const [mfaUser, setMfaUser] = useState(null); // State to hold the user object during MFA
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const result = await authenticate(email, password);

      if (result.session) {
        // Login successful, token received
        const token = result.session.getIdToken().getJwtToken();
        localStorage.setItem('token', token);
        navigate('/chat');
      } else if (result.mfaUser) {
        // MFA is required
        setMfaUser(result.mfaUser);
      }
    } catch (error) {
      setMessage(error.message || 'Login failed.');
    }
  };

  const handleMfaConfirmation = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const session = await confirmMfa(mfaUser, mfaCode);
      const token = session.getIdToken().getJwtToken();

      if (token) {
        localStorage.setItem('token', token);
        navigate('/chat');
      }
    } catch (error) {
      setMessage(error.message || 'MFA confirmation failed.');
    }
  };

  // If MFA is not required, show the login form
  if (!mfaUser) {
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

  // If MFA is required, show the MFA confirmation form
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

export default LoginPage;