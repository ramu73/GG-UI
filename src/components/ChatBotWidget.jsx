import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, PhoneCall, Sparkles, MessageCircle, ExternalLink } from 'lucide-react';
import { CHATBOT_QA, QUICK_PROMPTS } from '../data/faq';
import '../styles/ChatBotWidget.css';

export default function ChatBotWidget({ whatsappNumber = "+919876543210" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! Welcome to Godavari Grown 🍄\nI'm your AI Farm Assistant. I can help you with fresh mushroom rates, daily harvest status, delivery across East & West Godavari, wholesale pricing, or cooking recipes!",
      showPrompts: true,
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Answer matching logic (RAG-ready interface)
  const processQuery = async (queryText) => {
    setIsTyping(true);

    // Simulated short latency for natural feel
    await new Promise((res) => setTimeout(res, 500));

    const lower = queryText.toLowerCase();

    // Match against QA knowledge base
    const matched = CHATBOT_QA.find((item) =>
      item.triggers.some((trig) => lower.includes(trig))
    );

    let answerText = "";
    if (matched) {
      answerText = matched.answer;
    } else {
      answerText = `Thank you for asking about "${queryText}". Our farm team harvests daily in the Godavari basin. For real-time stock availability, large custom crates, or pincode confirmation, you can chat directly with our growers on WhatsApp!`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'bot',
        text: answerText,
        showWhatsAppHandoff: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(false);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    processQuery(userText);
  };

  const handlePromptClick = (promptText) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: promptText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    processQuery(promptText);
  };

  const openWhatsAppUrl = () => {
    const text = encodeURIComponent("Hi Godavari Grown! I was chatting with the website assistant and would like to speak to a farm specialist.");
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Hand-Drawn Sketch Match: "CHAT BOT" Floating Trigger */}
      <button
        className="chatbot-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Farm Chatbot"
      >
        <span className="chatbot-live-dot" />
        <span className="chatbot-trigger-icon">🍄</span>
        <span className="chatbot-trigger-text">CHAT BOT</span>
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="chatbot-drawer" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🌱</div>
              <div className="chat-title-group">
                <h4>Godavari Grown Assistant</h4>
                <span className="chat-status">
                  <span className="chatbot-live-dot" /> Online • RAG AI Ready
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={openWhatsAppUrl}
                title="Switch to WhatsApp"
              >
                <MessageCircle size={16} />
              </button>
              <button
                className="chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                <div className="msg-bubble">
                  {msg.text}

                  {/* Show quick prompts on welcome message */}
                  {msg.showPrompts && (
                    <div className="quick-prompts-container">
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', marginTop: '8px' }}>
                        POPULAR QUESTIONS:
                      </div>
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          className="quick-prompt-btn"
                          onClick={() => handlePromptClick(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* WhatsApp handoff pill */}
                  {msg.showWhatsAppHandoff && (
                    <button className="chat-wa-handoff" onClick={openWhatsAppUrl}>
                      <MessageCircle size={14} />
                      <span>Chat on WhatsApp for Live Order</span>
                    </button>
                  )}
                </div>
                <span className="msg-time">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="chat-msg bot">
                <div className="msg-bubble">
                  <span className="typing-dots">
                    <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot" style={{ animationDelay: '200ms' }} />
                    <span className="typing-dot" style={{ animationDelay: '400ms' }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form className="chat-footer" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about rates, delivery, recipes..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
