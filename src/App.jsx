import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import './app.css';

// 1. यहाँ अपनी API Key सीधे डाल दें (चूँकि यह पूरी तरह फ्रंटएंड ऐप है)
const ai = new GoogleGenAI({ apiKey: "AlzaSyDk20kZW7ieRysSXRTgKJ6Mm72qNBFnqh0" });

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  // चैट हिस्ट्री को जेमिनी के फॉर्मेट में रखने के लिए रिफ (Ref)
  const geminiHistory = useRef([]);

  // ऑटो स्क्रॉल डाउन करने के लिए
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText) return;

    // 1. स्क्रीन पर यूजर का मैसेज जोड़ें
    setMessages(prev => [...prev, { text: messageText, sender: "user" }]);
    setInput("");

    // 2. स्क्रीन पर 'Thinking...' लोड कराएं
    setMessages(prev => [...prev, { text: "Thinking...", sender: "bot", isThinking: true }]);

    try {
      // 3. जेमिनी के लिए हिस्ट्री एरे तैयार करें और नया मैसेज जोड़ें
      const contents = [...geminiHistory.current];
      contents.push({ role: 'user', parts: [{ text: messageText }] });

      // 4. सीधे फ्रंटएंड से जेमिनी API को कॉल करें
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: "You are a friendly AI assistant named NOVA MIND. Always reply naturally in Hinglish. Remember user details like their name throughout the conversation. Give real and unique responses. Never use boilerplate text like 'Main aapki baat samajh raha hoon'.",
        }
      });

      const botReply = response.text;

      // 5. 'Thinking...' हटाकर असली जवाब से अपडेट करें
      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); // Thinking... वाले मैसेज को हटाया
        return [...updated, { text: botReply, sender: "bot" }];
      });

      // 6. इस बातचीत को हिस्ट्री में सेव करें ताकि अगली बार याद रहे
      geminiHistory.current.push({ role: 'user', parts: [{ text: messageText }] });
      geminiHistory.current.push({ role: 'model', parts: [{ text: botReply }] });

    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { text: "Error: जेमिनी कनेक्ट नहीं हो पा रहा है।", sender: "bot" }];
      });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..." 
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;

