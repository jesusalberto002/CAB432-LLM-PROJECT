import { Routes, Route } from "react-router-dom"
import './App.css';
import { BrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './services/protectedRoute';

import Login from './pages/loginPage';
import Register from './pages/registerPage';
import MainChat from './pages/mainChatPage';



function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>LLM Application</h1>
          <Routes>
            {/* Redirect root path to login or chat based on auth */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* This is the protected route for the main chat */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <MainChat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
