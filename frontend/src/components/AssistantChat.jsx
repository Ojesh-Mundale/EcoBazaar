import React, { useState, useEffect, useRef } from 'react';
import { sendQuery } from '../services/api';
import ProductCard from './ProductCard';
import './AssistantChat.css';

const AssistantChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const response = await sendQuery(input);
      const botMessage = {
        from: 'bot',
        text: response.text,
        products: response.products,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { from: 'bot', text: 'Error: ' + error.message };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <>
      <div className="chatbot-backdrop show" onClick={onClose}></div>
      <div className="chatbot-interface" role="dialog" aria-modal="true" aria-label="Chatbot Interface">
        <button className="chatbot-close-btn" onClick={onClose} aria-label="Close Chatbot">
          &times;
        </button>
        <div className="assistant-chat">
          <div className="messages" aria-live="polite" aria-relevant="additions">
            {messages.map((m, i) =>
              m.from === 'bot' && m.products ? (
                <div key={i}>
                  <div className="bot-text">{m.text}</div>
                  <div className="product-list">
                    {m.products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              ) : (
                <div key={i} className={m.from}>
                  {m.text}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about eco-friendly products..."
            disabled={loading}
            aria-label="Chat input"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default AssistantChat;
