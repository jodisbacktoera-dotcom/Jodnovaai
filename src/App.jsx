import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nova_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hey! Main NOVA AI hoon. Baniye aaj main aapki kya madad karu?", isBot: true }
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

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const liveSpeechText = event.results.transcript;
      processLiveAIResponse(liveSpeechText, true); // true का मतलब आवाज़ से पूछा गया है
    };

    recognition.start();
  };

  // 🔊 TEXT TO SPEECH (AI का बोलकर जवाब देना)
  const speakLiveVoice = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0; 
      utterance.pitch = 1.0; 
      window.speechSynthesis.speak(utterance);
    }
  };

  // 🧠 एआई का दिमाग - सीधा और सटीक जवाब
  const processLiveAIResponse = (userText, shouldSpeak = false) => {
    if (!userText.trim()) return;

    // यूजर का मैसेज स्क्रीन पर दिखाएं
    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);

    const botLoadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botLoadingId, text: "Soch raha hoon...", isBot: true }]);

    setTimeout(() => {
      let botResponseText = "";
      const lowerText = userText.toLowerCase();

      // 1. ओनर का नाम सिर्फ पूछने पर ही बताएगा
      if (lowerText.includes('owner') || lowerText.includes('banaya') || lowerText.includes('maker') || lowerText.includes('who are you') || lowerText.includes('creator')) {
        botResponseText = "Mujhe Satyarth ne banaya hai, wahi mere creator aur owner hain.";
      } 
      // 2. फोटो जनरेशन सिस्टम
      else if (lowerText.includes('photo') || lowerText.includes('image') || lowerText.includes('banao')) {
        const encodedPrompt = encodeURIComponent(userText);
        const imageUrl = `https://pollinations.ai{encodedPrompt}?width=512&height=512&seed=${Date.now()}&nofeed=true`;
        botResponseText = `IMAGE_URL:${imageUrl}`;
      } 
      // 3. सामान्य बातचीत - अब कोई फालतू रिपीटेड लाइन नहीं आएगी!
      else if (lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('hi')) {
        botResponseText = "Hello! Baniye, kaise hain aap? Aaj kya madad chahiye?";
      } else if (lowerText.includes('kaise ho')) {
        botResponseText = "Main badhiya hoon bhai! Aap batao, aap kaise ho?";
      } else {
        // डिफ़ॉल्ट सीधा जवाब (यहाँ बाद में आपकी असली Gemini API कनेक्ट होगी)
        botResponseText = `Aapne pucha: "${userText}". Main iska jawab dhoodh raha hoon, jaldi hi seekh jaunga!`;
      }

      // स्क्रीन पर जवाब अपडेट करें
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? { id: botLoadingId, text: botResponseText, isBot: true } : msg
      ));

      // अगर आवाज़ से पूछा था या टाइप करके भी बुलवाना चाहते हैं
      if (shouldSpeak && !botResponseText.startsWith('IMAGE_URL:')) {
        speakLiveVoice(botResponseText);
      }
    }, 600);
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processLiveAIResponse(input, false); // टाइप करने पर बोट चुप रहेगा, सिर्फ टेक्स्ट दिखाएगा
    setInput('');
  };

  return (
    <div className="app-container">
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
            onClick={toggleLiveVoiceChat} 
            className={`action-btn mic-btn ${isListening ? 'live-active' : ''}`}
            title="Voice Chat"
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

