import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "AlzaSyDk20kZW7ieRysSXRTgKJ6Mm72qNBFnqh0" });

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const geminiHistory = useRef([]);

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
      const contents = [...geminiHistory.current];
      contents.push({ role: 'user', parts: [{ text: messageText }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: "You are a friendly AI assistant named NOVA MIND. Always reply naturally in Hinglish. Give real and unique responses. Never use boilerplate text like 'Main aapki baat samajh raha hoon'.",
        }
      });

      const botReply = response.text;

      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); 
        return [...updated, { text: botReply, sender: "bot" }];
      });

      geminiHistory.current.push({ role: 'user', parts: [{ text: messageText }] });
      geminiHistory.current.push({ role: 'model', parts: [{ text: botReply }] });

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { text: "Error: कनेक्ट नहीं हो पा रहा है।", sender: "bot" }];
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
