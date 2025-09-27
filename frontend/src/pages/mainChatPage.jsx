// frontend/src/MainChat.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios'; // Import your pre-configured axios instance
import './MainChat.css'; // Import the new CSS
import DocumentUpload from '../components/documentUpload';
import ChatHistory from '../components/ChatHistory';

function MainChat() {
  const navigate = useNavigate();
  // Initialize state with an array containing one object, as React expects.
  const [messages, setMessages] = useState([
    { sender: 'llm', text: 'Fetching a quote for you...' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await api.get('/quote');
        const quote = response.data;
        // Correctly format the initial message as an object within an array.
        const welcomeMessage = {
          sender: 'llm',
          text: `**Quote of the Day:**\n\n> "${quote.content}" — *${quote.author}*\n\nHow can I help you today?`
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        // Ensure the fallback is also an object in an array.
        setMessages([{ sender: 'llm', text: 'Hello! How can I help you today?' }]);
      }
    };

    fetchQuote();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;
    
    setIsLoading(true);

    const token = localStorage.getItem('token');

    // If a file is selected, upload it first
    if (selectedFile) {
    try {
      // Step 1: Get the pre-signed URL from our backend
      const urlResponse = await api.post('/documents/generate-upload-url',
        { filename: selectedFile.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { url, fields } = urlResponse.data;

      // Step 2: Upload the file directly to S3 using the pre-signed URL
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', selectedFile);

      await fetch(url, {
        method: 'POST',
        body: formData,
      });

      // Step 3: Confirm the upload with our backend
      await api.post('/documents/confirm-upload',
        { filename: selectedFile.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("File uploaded successfully");

    } catch (error) {
      console.error("File upload failed:", error);
      const errorResponse = { sender: 'llm', text: 'Sorry, the file upload failed.' };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setSelectedFile(null); // Clear the file after attempting upload
    }
  }
    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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
        <div>
          <button onClick={() => setShowHistory(true)} className="history-button">History</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
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
      <ChatHistory show={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}

export default MainChat;
