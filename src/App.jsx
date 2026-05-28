import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nova_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hey! Main NOVA AI hoon. Satyarth ne mujhe banaya hai. Main aapse live voice me baat kar sakta hoon aur photo bhi bana sakta hoon. Baniye kya madad karu?", isBot: true }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nova_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎙️ LIVE AUDIO CHAT SYSTEM (कॉल की तरह बोलना और सुनना)
  const toggleLiveVoiceChat = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapka device live voice support nahi karta. Google Chrome use karein.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const liveSpeechText = event.results.transcript;
      processLiveAIResponse(liveSpeechText);
    };

    recognition.start();
  };

  // 🔊 LIVE AUDIO RESPONSE (AI तुरंत बोलकर जवाब देगा)
  const speakLiveVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0; 
      utterance.pitch = 1.1; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // एआई का दिमाग - ओनर का नाम 'Satyarth' और फोटो जनरेशन हैंडलर
  const processLiveAIResponse = (userText) => {
    if (!userText.trim()) return;

    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);

    const botLoadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botLoadingId, text: "Nova sun raha hai...", isBot: true }]);

    setTimeout(() => {
      let botResponseText = "";
      const lowerText = userText.toLowerCase();

      // ओनर का नाम फिक्स (Satyarth)
      if (lowerText.includes('owner') || lowerText.includes('banaya') || lowerText.includes('maker') || lowerText.includes('who are you') || lowerText.includes('naam')) {
        botResponseText = "Mujhe Satyarth ne banaya hai. Satyarth hi mere creator aur owner hain.";
      } 
      // फोटो जनरेशन सिस्टम
      else if (lowerText.includes('photo') || lowerText.includes('image') || lowerText.includes('banao')) {
        const encodedPrompt = encodeURIComponent(userText);
        const imageUrl = `https://pollinations.ai{encodedPrompt}?width=512&height=512&seed=${Date.now()}&nofeed=true`;
        botResponseText = `IMAGE_URL:${imageUrl}`;
      } 
      // नॉर्मल बातचीत
      else {
        botResponseText = `Satyarth ke Nova AI ne aapki baat sun li. Aapne kaha: "${userText}".`;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? { id: botLoadingId, text: botResponseText, isBot: true } : msg
      ));

      // लाइव वॉइस रिस्पॉन्स ट्रिगर
      if (!botResponseText.startsWith('IMAGE_URL:')) {
        speakLiveVoice(botResponseText);
      }
    }, 800);
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processLiveAIResponse(input);
    setInput('');
  };

  return (
    <div className="app-container">
      {/* लोगो और ब्रांडिंग हेडर बार */}
      <header className="app-header">
        <div className="logo-container">
          <div className="nova-logo-glow"></div>
          <span className="logo-icon">🌌</span>
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
            placeholder="Satyarth ke Nova se baat karein..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button 
            type="button" 
            onClick={toggleLiveVoiceChat} 
            className={`action-btn mic-btn ${isListening ? 'live-active' : ''}`}
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
