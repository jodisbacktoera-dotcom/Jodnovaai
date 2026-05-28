import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logoImg from './assets/logo.png';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nova_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hello! Main NOVA AI hoon. Baniye aaj main aapki kya madad karu?", isBot: true }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nova_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎙️ VOICE TYPING SYSTEM (सिर्फ आपकी आवाज़ सुनकर टाइप करेगा, बोट खुद नहीं बोलेगा)
  const toggleVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapka device voice support nahi karta. Google Chrome use karein.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechToText = event.results.transcript;
      setInput(speechToText); // आपकी आवाज़ को सिर्फ टेक्स्ट बॉक्स में लिख देगा
    };

    recognition.start();
  };

  // 🧠 एआई का दिमाग - सीधा और सटीक जवाब (No Text-to-Speech)
  const processAIResponse = (userText) => {
    if (!userText.trim()) return;

    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);

    const botLoadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botLoadingId, text: "Soch raha hoon...", isBot: true }]);

    setTimeout(() => {
      let botResponseText = "";
      const lowerText = userText.toLowerCase();

      // ओनर का नाम सिर्फ पूछने पर ही बताएगा
      if (lowerText.includes('owner') || lowerText.includes('banaya') || lowerText.includes('maker') || lowerText.includes('who are you') || lowerText.includes('creator')) {
        botResponseText = "Mujhe Satyarth ne banaya hai, wahi mere creator aur owner hain.";
      } 
      // फोटो जनरेशन सिस्टम
      else if (lowerText.includes('photo') || lowerText.includes('image') || lowerText.includes('banao')) {
        const encodedPrompt = encodeURIComponent(userText);
        const imageUrl = `https://pollinations.ai{encodedPrompt}?width=512&height=512&seed=${Date.now()}&nofeed=true`;
        botResponseText = `IMAGE_URL:${imageUrl}`;
      } 
      // सामान्य बातचीत
      else if (lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('hi')) {
        botResponseText = "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?";
      } else if (lowerText.includes('kaise ho')) {
        botResponseText = "Main badhiya hoon bhai! Aap batao, aap kaise ho?";
      } else {
        botResponseText = `Aapne pucha: "${userText}". Main iska jawab dhoodh raha hoon.`;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? { id: botLoadingId, text: botResponseText, isBot: true } : msg
      ));
      // यहाँ से पूरा बोलने वाला फंक्शन (speak) हटा दिया गया है
    }, 600);
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processAIResponse(input);
    setInput('');
  };

  return (
    <div className="app-container">
      {/* परफेक्ट हेडर लेआउट */}
      <header className="app-header">
        <div className="logo-box">
          <img src={logoImg} alt="Logo" className="header-logo-img" />
        </div>
        <h1>NOVA MIND</h1>
      </header>

      <main className="chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="message-box">
              {msg.text.startsWith('IMAGE_URL:') ? (
                <div className="image-card">
                  <img 
                    src={msg.text.replace('IMAGE_URL:', '')} 
                    alt="AI Creation" 
                    className="ai-generated-img"
                  />
                  <span className="image-tag">Created by NOVA</span>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="input-footer">
        <form onSubmit={handleSendSubmit} className="input-form">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button 
            type="button" 
            onClick={toggleVoiceTyping} 
            className={`action-btn mic-btn ${isListening ? 'listening-active' : ''}`}
          >
            {isListening ? '🟢' : '🎙️'}
          </button>
          <button type="submit" className="send-btn">➔</button>
        </form>
      </footer>
    </div>
  );
}

export default App;

