// frontend/src/pages/confirmPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmSignUp } from '../services/cognito';
import './pages.css';

function ConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Get email from navigation state
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    try {
      // Use email to confirm the user
      await confirmSignUp(email, code);
      setIsSuccess(true);
      setMessage('Confirmation successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.message || 'Confirmation failed. Please check the code.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleConfirm} className="auth-form">
        <h2>Confirm Your Account</h2>
        <p>A confirmation code has been sent to your email address.</p>
        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter the email you registered with"
          />
        </div>
        <div className="input-group">
          <label>Confirmation Code:</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Confirm</button>
        {message && (
          <p className={`message ${isSuccess ? 'success-message' : ''}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default ConfirmPage;