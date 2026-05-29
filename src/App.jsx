import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText) return;

    setMessages(prev => [...prev, { text: messageText, sender: "user" }]);
    setInput("");
    setMessages(prev => [...prev, { text: "Thinking...", sender: "bot" }]);

    try {
      // ध्यान दें: यहाँ हमने सीधा OpenRouter की जगह Vercel एनवायरनमेंट वेरिएबल का उपयोग करने के लिए रीराइट किया है
      // ब्राउज़र से ब्लॉक होने से बचने के लिए हम Vercel पर सेट वेरिएबल का उपयोग करेंगे
      const response = await fetch("https://openrouter.ai", {
        method: "POST",
        headers: {
          // यह लाइन अब बिना किसी एरर के गिटहब पर जाएगी क्योंकि इसमें असली की (key) छुपी हुई है
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vercel.app",
          "X-Title": "Nova Mind"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [
            { 
              role: "system", 
              content: "You are a friendly AI assistant named NOVA MIND. Always reply naturally and uniquely in Hinglish. Remember user details like their name throughout the conversation. Never use repetitive template answers." 
            },
            ...chatHistory,
            { role: "user", content: messageText }
          ]
        })
      });

      const data = await response.json();
      const botReply = data.choices.message.content;

      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); 
        return [...updated, { text: botReply, sender: "bot" }];
      });

      setChatHistory(prev => [
        ...prev,
        { role: "user", content: messageText },
        { role: "assistant", content: botReply }
      ]);

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { text: "Error: नेटवर्क काम नहीं कर रहा है।", sender: "bot" }];
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#e6edf3', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* हेडर बार */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#0d1117', borderBottom: '1px solid #21262d' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #1f4068, #162447)', display: 'flex', justifyContent: 'center', alignMitems: 'center', marginRight: '12px', border: '1px solid #007bff' }}>
          <span style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold' }}>AI</span>
        </div>
        <span style={{ color: '#007bff', fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.5px' }}>NOVA MIND</span>
      </div>

      {/* चैट बॉक्स */}
      <div ref={chatBoxRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0b0f19' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            background: msg.sender === 'user' ? '#004494' : '#161b22',
            color: '#f0f6fc',
            padding: '12px 16px',
            borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            maxWidth: '80%',
            wordBreak: 'break-word',
            fontSize: '15px',
            lineHeight: '1.4',
            border: msg.sender === 'user' ? 'none' : '1px solid #21262d'
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* बॉटम इनपुट एरिया */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#0d1117', borderTop: '1px solid #21262d', gap: '12px' }}>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>

        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..." 
          style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #30363d', background: '#161b22', color: '#f0f6fc', outline: 'none', fontSize: '15px' }}
        />

        <button onClick={sendMessage} style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#007bff', border: 'none', display: 'flex', justifyContent: 'center', alignMitems: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

    </div>
  );
}

export default App;

