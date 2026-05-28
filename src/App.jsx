import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState(() => {
    // मेमोरी सिस्टम: पहले से सेव चैट लोड करना
    const saved = localStorage.getItem('nova_chat_history');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hey! Main NOVA AI hoon. Main aapka naam yaad rakh sakta hoon, voice me baat kar sakta hoon aur photo bhi bana sakta hoon. Baniye kya madad karu?", isBot: true }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  // चैट हिस्ट्री को मेमोरी (localStorage) में सेव रखना
  useEffect(() => {
    localStorage.setItem('nova_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎙️ VOICE TO TEXT (आपकी आवाज़ सुनना)
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapka browser voice typing support nahi karta. Chrome use karein.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // हिंदी और इंग्लिश मिक्स समझेगा
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
    };

    recognition.start();
  };

  // 🔊 TEXT TO SPEECH (AI का बोलकर जवाब देना)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // पुराना बोलना बंद करें
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // अस्थायी बोट मैसेज (Loading...)
    const botLoadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botLoadingId, text: "Nova soch raha hai...", isBot: true }]);

    try {
      let botResponseText = "";

      // 📷 PHOTO GENERATION API TRIGGER
      if (userText.toLowerCase().includes('photo') || userText.toLowerCase().includes('image') || userText.toLowerCase().includes('banao')) {
        // Pollinations AI का इस्तेमाल करके बिल्कुल फ्री में फोटो बनाना
        const encodedPrompt = encodeURIComponent(userText);
        const imageUrl = `https://pollinations.ai{encodedPrompt}?width=512&height=512&seed=${Date.now()}&nofeed=true`;
        
        // फोटो को चैट में दिखाने के लिए HTML इमेज टैग की तरह सेव करना
        botResponseText = `IMAGE_URL:${imageUrl}`;
      } else {
        // 🧠 MEMORY + CHAT (यहाँ आपकी Gemini API कनेक्ट होगी)
        // अभी के लिए टेस्टिंग रिस्पॉन्स जब तक आप API Key नहीं डालते
        if(userText.toLowerCase().includes('naam')) {
          botResponseText = "Aapne abhi API key set nahi ki hai, isliye mujhe aapka naam yaad rakhne me dikkat ho rahi hai. Vercel par API Key set karein!";
        } else {
          botResponseText = `Aapne kaha: "${userText}". Nova Assistant abhi poori tarah ready hai!`;
        }
      }

      // लोड हो रहे मैसेज को असली जवाब से बदलना
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? { id: botLoadingId, text: botResponseText, isBot: true } : msg
      ));

      // अगर नॉर्मल टेक्स्ट जवाब है तो AI बोलकर सुनाएगा
      if (!botResponseText.startsWith('IMAGE_URL:')) {
        speakText(botResponseText);
      }

    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingId ? { id: botLoadingId, text: "Oops! Kuch error aa gaya.", isBot: true, isError: true } : msg
      ));
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NOVA MIND AI</h1>
      </header>

      <main className="chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
            <div className={`message-box ${msg.isError ? 'error-box' : ''}`}>
              {msg.text.startsWith('IMAGE_URL:') ? (
                <img 
                  src={msg.text.replace('IMAGE_URL:', '')} 
                  alt="AI Generated" 
                  className="ai-generated-img"
                  loading="lazy"
                />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="input-footer">
        <form onSubmit={handleSend} className="input-form">
          <input 
            type="text" 
            placeholder="Ask anything or ask to make a photo..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input"
          />
          <button 
            type="button" 
            onClick={startSpeechRecognition} 
            className={`action-btn mic-btn ${isListening ? 'listening' : ''}`}
            title="Voice Chat"
          >
            {isListening ? '🛑' : '🎙️'}
          </button>
          <button type="submit" className="send-btn">➔</button>
        </form>
      </footer>
    </div>
  );
}

export default App;

