import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Loader2, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const GREETINGS = {
  hr: "Hi! I'm your InternFlow AI. Ask me about pipeline status, pending documents, onboarding progress, or any platform stats.",
  admin: "Hi! I'm your InternFlow AI. Ask me about platform stats, pipeline, pending documents, or any operational questions.",
  employee: "Hi! I'm your InternFlow AI. Ask me about your referral status, quota remaining, candidate updates, or reward tracking.",
  mentor: "Hi! I'm your InternFlow AI. Ask me about your assigned interns, pending project reviews, LMS progress, or feedback history.",
  intern: "Hi! I'm your InternFlow AI. Ask me about your application status, documents, learning progress, project, credentials, or certificate.",
};

const ROLE_BADGE = {
  hr: 'bg-purple-100 text-purple-700',
  admin: 'bg-slate-100 text-slate-700',
  employee: 'bg-emerald-100 text-emerald-700',
  mentor: 'bg-amber-100 text-amber-700',
  intern: 'bg-sky-100 text-sky-700',
};

// Renders a line with basic inline **bold** support
function InlineLine({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

// Renders multi-line assistant message with bullet and bold support
function MessageBody({ content }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const isBullet = /^[-•*]\s/.test(line);
        if (isBullet) {
          return (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="mt-[7px] w-1 h-1 rounded-full bg-current flex-shrink-0 opacity-50" />
              <span><InlineLine text={line.replace(/^[-•*]\s/, '')} /></span>
            </div>
          );
        }
        return <p key={i}><InlineLine text={line} /></p>;
      })}
    </div>
  );
}

export default function AIAssistant() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const role = user?.role || 'intern';

  // Show greeting on first open
  useEffect(() => {
    if (isOpen && !initialized) {
      setMessages([{ id: 0, role: 'assistant', content: GREETINGS[role] || GREETINGS.intern }]);
      setInitialized(true);
    }
  }, [isOpen, initialized, role]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/api/ai-assistant/chat', { message: text, history });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment.", isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) return null;

  const badgeClass = ROLE_BADGE[role] || ROLE_BADGE.intern;
  const roleLabel = { hr: 'HR', admin: 'Admin', employee: 'Employee', mentor: 'Mentor', intern: 'Intern' }[role] || 'User';

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-purple-600 text-white shadow-xl
          hover:bg-purple-700 active:scale-95 transition-all duration-200 flex items-center justify-center
          ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat drawer */}
      <div
        className={`fixed z-50 flex flex-col bg-white shadow-2xl border border-slate-200
          transition-all duration-300 ease-out
          bottom-0 right-0 w-full
          md:bottom-6 md:right-6 md:w-[400px] md:rounded-2xl
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}
        `}
        style={{ height: 'min(580px, 90dvh)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none mb-1">AI Assistant</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                {roleLabel} View
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${msg.role === 'user' ? 'bg-purple-600' : 'bg-slate-100'}`}>
                {msg.role === 'user'
                  ? <User className="w-3.5 h-3.5 text-white" />
                  : <Bot className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              {/* Bubble */}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                {msg.role === 'user'
                  ? <p>{msg.content}</p>
                  : <MessageBody content={msg.content} />}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-slate-100 p-3">
          <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
            focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none outline-none max-h-24 leading-5 py-0.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0
                hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-1.5">
            Enter to send · Shift+Enter for new line · Read-only view
          </p>
        </div>
      </div>
    </>
  );
}
