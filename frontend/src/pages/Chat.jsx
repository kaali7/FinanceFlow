import React, { useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Financial Literacy Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat/', {
        message: input,
        user_id: "demo-user"
      });
      
      const aiMsg = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow h-[80vh] flex flex-col">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t">
        <h2 className="text-xl font-bold">AI Financial Assistant</h2>
        <p className="text-sm opacity-90">Ask about budgeting, savings, or financial concepts.</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm italic">AI is typing...</div>}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input 
          type="text" 
          className="flex-1 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
      <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
        Disclaimer: This AI provides educational information only and does not constitute financial advice.
      </div>
    </div>
  );
};

export default Chat;
