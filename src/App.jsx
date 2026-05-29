import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// आपकी बिल्कुल सही API Key
const genAI = new GoogleGenerativeAI("AlzaSyDk20kZW7ieRysSXRTgKJ6Mm72qNBFnqh0");

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  // चैट हिस्ट्री को सही फॉर्मेट में रखने के लिए
  const [chatSession, setChatSession] = useState(null);

  // पहली बार ऐप लोड होने पर जेमिनी चैट सेशन शुरू करें
  useEffect(() => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a friendly AI assistant named NOVA MIND. Always reply naturally in Hinglish. Remember user details like their name throughout the conversation. Give real and unique responses. Never use boilerplate text like 'Main aapki baat samajh raha hoon'.",
    });
    
    // यह अपने आप पूरी हिस्ट्री याद रखेगा
    const session = model.startChat({ history: [] });
    setChatSession(session);
  }, []);

  // ऑटो स्क्रॉल डाउन
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || !chatSession) return;

    // 1. यूजर का मैसेज दिखाएं
    setMessages(prev => [...prev, { text: messageText, sender: "user" }]);
    setInput("");

    // 2. 'Thinking...' लोड कराएं
    setMessages(prev => [...prev, { text: "Thinking...", sender: "bot" }]);

    try {
      // 3. जेमिनी चैट सेशन को सीधे मैसेज भेजें
      const result = await chatSession.sendMessage(messageText);
      const botReply = result.response.text();

      // 4. 'Thinking...' हटाकर असली जवाब अपडेट करें
      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); 
        return [...updated, { text: botReply, sender: "bot" }];
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { text: "Error: जेमिनी रिस्पॉन्स नहीं दे पा रहा है।", sender: "bot" }];
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <div ref={chatBoxRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            background: msg.sender === 'user' ? '#007bff' : '#333',
            padding: '10px 15px',
            borderRadius: '15px',
            maxWidth: '75%',
            wordBreak: 'break-word'
          }}>
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '5px', padding: '10px 0' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..." 
          style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#3a3a3a', color: 'white', outline: 'none' }}
        />
        <button onClick={sendMessage} style={{ background: '#007bff', color: 'white', border: 'none', padding: '0 20px', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}

export default App;
