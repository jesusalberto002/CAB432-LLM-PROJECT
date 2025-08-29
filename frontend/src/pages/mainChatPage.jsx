// frontend/src/MainChat.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios'; // Import your pre-configured axios instance
import './MainChat.css'; // Import the new CSS
import DocumentUpload from '../components/documentUpload';

function MainChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: 'llm', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    
    setIsLoading(true);

    // If a file is selected, upload it first
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const token = localStorage.getItem('token');
        await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        // You can add a success message or handle the response
      } catch (error) {
        console.error("File upload failed:", error);
      }
      setSelectedFile(null); // Clear the file after sending
    }

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/chat', 
        { prompt: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const llmResponse = { sender: 'llm', text: response.data.response };
      setMessages(prevMessages => [...prevMessages, llmResponse]);

    } catch (error) {
      console.error("Error fetching LLM response:", error);
      const errorResponse = { sender: 'llm', text: 'Sorry, I encountered an error.' };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-header">
        <h2>LLM Chat</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      <div className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'llm-message'}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <DocumentUpload onFileSelect={setSelectedFile} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message or upload a file..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
        {selectedFile && (
          <div className="file-tag">
            <span>{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}>✖</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainChat;