import React, { useState, useEffect } from 'react';
import api from '../services/api';
// import api from '../services/api';
// import ReactMarkdown from 'react-markdown'; // Removed to prevent crash
import { Send, Bot, User, Trash2 } from 'lucide-react';

const MessageContent = ({ text }) => {
  if (!text) return null;

  // Split text by new lines
  const lines = text.split('\n');

  return (
    <div className="text-sm leading-relaxed space-y-2">
      {lines.map((line, index) => {
        // Handle headings (###)
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold my-2">{line.replace('### ', '')}</h3>;
        }

        // Handle list items (* or -)
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const content = line.trim().replace(/^[\*\-]\s+/, '');
             // Parse bold in list item
            const parts = content.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={index} className="flex gap-2 ml-2">
                 <span className="text-gray-500 mt-1.5">•</span>
                 <span className="flex-1">
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-semibold text-indigo-700">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                 </span>
              </div>
            );
        }

        // Handle paragraphs with bold text
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="min-h-[1.2em]">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-indigo-700">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Financial Literacy Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      if (res.data && res.data.length > 0) {
        const history = res.data.map(msg => ({
          role: msg.role, // 'user' or 'assistant'
          text: msg.content
        }));
        setMessages(history);
      }
    } catch (error) {
       console.error("Failed to load history", error);
    }
  };

  const clearHistory = async () => {
    if(!window.confirm("Clear all chat history?")) return;
    try {
      await api.delete('/chat/history');
      setMessages([{ role: 'assistant', text: 'History cleared. How can I help you?' }]);
    } catch (error) {
      console.error("Failed to clear history", error);
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/generate', { message: input });
      setMessages([...newMsgs, { role: 'assistant', text: res.data.response }]);
    } catch {
      setMessages([...newMsgs, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] card-base p-0 overflow-hidden">
      <div className="bg-primary p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
            <h2 className="text-white font-bold text-lg">AI Financial Assistant</h2>
            <p className="text-indigo-100 text-xs">Ask about budgeting, savings, or strategies</p>
            </div>
        </div>
        <button onClick={clearHistory} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors" title="Clear History">
            <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-full flex-shrink-0 ${m.role === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
              {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div
              className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${
                m.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              <div className={`${m.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {m.role === 'user' ? (
                   <p className="text-sm">{m.text}</p>
                ) : (
                   <MessageContent text={m.text} />
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex items-start gap-3">
             <div className="p-2 rounded-full bg-secondary flex-shrink-0">
               <Bot className="w-4 h-4 text-white" />
             </div>
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
               </div>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            className="input-field"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button 
            onClick={send} 
            disabled={loading}
            className="btn-primary rounded-xl px-4"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default Chat;
