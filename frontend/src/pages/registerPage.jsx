// frontend/src/pages/registerPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../services/cognito';
import './pages.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      //pass the email as the username to Cognito
      await signUp(email, password);
      // On success, navigate to the confirmation page, passing the email
      navigate('/confirm', { state: { email } });
    } catch (error) {
      setMessage(error.message || 'Registration failed.');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Register</h2>
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
            placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol"
          />
        </div>
        <button type="submit" className="auth-button">Register</button>
        {message && <p className="message">{message}</p>}
        <p className="switch-link">
          Already have an account? <Link to="/login">Login here.</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;