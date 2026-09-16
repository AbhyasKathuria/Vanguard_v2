import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Send, 
  Mic, 
  Trash2,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { chatWithAI } from '../lib/gemini';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const { t, i18n } = useTranslation();
  const { dbUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle');
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const isDev = (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') || import.meta.env.DEV;

  useEffect(() => {
    const testGemini = async () => {
      const key = import.meta.env.VITE_GEMINI_API_KEY
      console.log('Testing Gemini. Key present:', !!key)
      console.log('Key prefix:', key?.substring(0, 10))
      
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Say hello in one word' }] }]
            })
          }
        )
        const data = await res.json()
        console.log('Gemini test response:', JSON.stringify(data))
        
        if (data.error) {
          console.error('Gemini error:', data.error.message)
          setAiStatus('error: ' + data.error.message)
        } else {
          console.log('Gemini working!')
          setAiStatus('connected')
        }
      } catch (err) {
        console.error('Gemini fetch failed:', err)
        setAiStatus('fetch_failed')
      }
    }
    testGemini()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Setup Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      const getSpeechLang = (lang) => {
        const mapping = {
          en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
          ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN'
        };
        return mapping[lang] || 'en-IN';
      };

      rec.lang = getSpeechLang(localStorage.getItem('vanguard_language') || 'en');

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInputValue(text);
        setIsListening(false);
      };

      rec.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          toast.error("Microphone permission denied. Please allow microphone access.");
        } else {
          toast.error("Speech input error. Please try again or type your message.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const mapping = {
      en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
      ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN'
    };
    utterance.lang = mapping[lang] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleQuickPrompt = (text) => {
    setInputValue(text)
    handleSend(text) // immediately send without requiring user to click send
  }

  const handleSend = async (overrideText) => {
    const messageText = overrideText || inputValue.trim()
    if (!messageText) return

    setInputValue('')
    const userMsg = { role: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const location = `${dbUser?.village || ''}, ${dbUser?.district || 'India'}`
      const reply = await chatWithAI(messageText, location, i18n.language)
      speakText(reply, i18n.language);
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch (err) {
      console.error('AI error:', err)
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Unable to connect to AI. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  const EmptyStateJSX = () => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      textAlign: 'center',
      gap: 24,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bot size={40} color="var(--accent)" />
      </div>

      <div>
        <h3 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--text)',
          margin: '0 0 10px',
        }}>
          How can I assist you today?
        </h3>
        <p style={{
          fontSize: 15, color: 'var(--text-muted)',
          lineHeight: 1.65, margin: 0, maxWidth: 440,
        }}>
          I can guide you on local department responsibilities,
          predicted risks, or help compose a formal civic report.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        width: '100%',
        maxWidth: 540,
      }}>
        {[
          'Water overflowing near school',
          'Who handles electricity issues?',
          'Garbage not collected for 3 days',
          'How to report a pothole?',
        ].map(prompt => (
          <button
            key={prompt}
            onClick={() => handleQuickPrompt(prompt)}
            style={{
              padding: '14px 18px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: 'var(--text)',
              fontSize: 14,
              textAlign: 'left',
              cursor: 'pointer',
              lineHeight: 1.5,
              fontFamily: 'inherit',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );

  const MessageRow = ({ msg }) => (
    <div style={{
      display: 'flex',
      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
      gap: 10,
      alignItems: 'flex-start',
    }}>
      {msg.role === 'ai' && (
        <div style={{
          width: 32, height: 32, flexShrink: 0, borderRadius: '50%',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bot size={16} color="var(--accent)" />
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        padding: '12px 16px',
        borderRadius: msg.role === 'user'
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
        color: msg.role === 'user' ? '#fff' : 'var(--text)',
        fontSize: 15,
        lineHeight: 1.6,
        wordBreak: 'break-word',
      }}>
        {msg.text}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader 
        title={t('ai_title', 'AI Assistant')} 
        subtitle={t('ai_subtitle', 'Ask anything about civic procedures, local guidelines, and safety alerts.')} 
        action={
          messages.length > 0 ? (
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition"
              title={t('clear_chat', 'Clear Chat')}
            >
              <Trash2 className="w-4 h-4" /> {t('clear_chat', 'Clear Chat')}
            </button>
          ) : undefined
        }
      />
      
      {/* Development status block */}
      {isDev && (
        <div style={{fontSize:'11px', color:'gray', padding:'4px 8px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', textAlign: 'center', marginBottom: 8}}>
          AI Status: {aiStatus}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        minHeight: 480,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* scrollable messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '20px 24px',
        }}>
          {messages.length === 0
            ? <EmptyStateJSX />
            : messages.map((msg, i) => <MessageRow key={i} msg={msg} />)
          }
          {isLoading && (
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              color: 'var(--text-muted)', fontSize: 14,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={16} color="var(--accent)" />
              </div>
              <span>Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* input bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 20px',
          display: 'flex', gap: 10, alignItems: 'center',
          flexShrink: 0,
          background: 'var(--surface)',
        }}>
          <button 
            type="button"
            onClick={toggleListening}
            style={{
              width: 40, height: 40, flexShrink: 0,
              borderRadius: '50%', border: '1px solid var(--border)',
              background: isListening ? '#DC2626' : 'var(--surface-2)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isListening ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Mic size={18} />
          </button>
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            style={{
              flex: 1, height: 44,
              padding: '0 16px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 22,
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            style={{
              width: 44, height: 44, flexShrink: 0,
              borderRadius: '50%',
              background: inputValue.trim() ? 'var(--accent)' : 'var(--surface-2)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: inputValue.trim() ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
