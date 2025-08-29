import { React, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import api from '../api/axios';

import './pages.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(''); 

    try {
      const response = await api.post('/register', { username, password });
      if (response.status === 201) {
        setMessage('Registration successful! Redirecting to login...');
        
        // Wait 2 seconds so the user can read the message, then redirect
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || 'Registration failed.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setMessage('An error occurred. Please try again.');
      }
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Register</h2>
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
        <button type="submit" className="auth-button">Register</button>
        {message && <p className={`message ${message.includes('successful') ? 'success-message' : ''}`}>{message}</p>}
        <p className="switch-link">
          Already have an account? <Link to="/login">Login here.</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;