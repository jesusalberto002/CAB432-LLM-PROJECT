// frontend/src/components/ChatHistory.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import './ChatHistory.css';

function ChatHistory({ show, onClose }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      setError('');
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await api.get('/chat/history', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setHistory(response.data.history || []);
        } catch (err) {
          setError('Failed to fetch chat history.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [show]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) {
      return history;
    }
    return history.filter(
      (msg) =>
        msg.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.response.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  if (!show) {
    return null;
  }

  return (
    <div className="history-modal-overlay">
      <div className="history-modal">
        <div className="history-modal-header">
          <h2>Chat History</h2>
          <button onClick={onClose} className="history-close-button">&times;</button>
        </div>
        <div className="history-modal-body">
          <input
            type="text"
            placeholder="Filter history..."
            className="history-search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isLoading ? (
            <p>Loading history...</p>
          ) : error ? (
            <p className="history-error">{error}</p>
          ) : (
            <div className="history-list">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((msg) => (
                  <div key={msg.id} className="history-item">
                    <div className="history-prompt">
                      <strong>You:</strong> <ReactMarkdown>{msg.prompt}</ReactMarkdown>
                    </div>
                    <div className="history-response">
                      <strong>LLM:</strong> <ReactMarkdown>{msg.response}</ReactMarkdown>
                    </div>
                    <div className="history-timestamp">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p>No history found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHistory;
