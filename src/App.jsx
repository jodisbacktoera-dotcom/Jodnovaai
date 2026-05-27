import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function App() {
  const [messages, setMessages] = useState([{ text: "Haan bhai bolo! Main aapka NOVA MIND AI hu. Aaj kya help chahiye?", sender: "ai" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [filter, setFilter] = useState('none');

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const chatSessionRef = useRef(null);

  useEffect(() => {
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyDk20kZW7ieRYssXRTgKJ6Mm72qNBFnqh0");
      chatSessionRef.current = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).startChat({
        history: [
          { role: "user", parts: [{ text: "Hello AI, aaj se tumhara naam NOVA MIND AI hai. Aur tum mere friendly assistant ho." }] },
          { role: "model", parts: [{ text: "Haan bhai bolo! Main aapka NOVA MIND AI assistant hu. Aaj kya help chahiye?" }] }
        ]
      });
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, editingImage]);

  const startVoiceTyping = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported");
    const rec = new SpeechRecognition();
    rec.lang = 'hi-IN';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setInput(prev => prev + " " + e.results[0][0].transcript);
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setEditingImage(ev.target.result); setFilter('none'); };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!editingImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = editingImage;
    img.onload = () => {
      canvas.width = img.width > 400 ? 400 : img.width;
      canvas.height = (img.height / img.width) * canvas.width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (filter === 'grayscale') ctx.filter = 'grayscale(100%)';
      else if (filter === 'sepia') ctx.filter = 'sepia(100%)';
      else if (filter === 'blur') ctx.filter = 'blur(4px)';
      else if (filter === 'invert') ctx.filter = 'invert(100%)';
      else ctx.filter = 'none';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [editingImage, filter]);

  const saveEditedImage = () => {
    const url = canvasRef.current.toDataURL('image/jpeg');
    setMessages(prev => [...prev, { text: "Maine ek photo edit ki hai:", sender: "user" }, { text: url, sender: "user", isImage: true }, { text: "Wah bhai! Photo kamaal ki edit hui hai. Filter ekdum solid lag raha hai!", sender: "ai" }]);
    setEditingImage(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    setMessages(prev => [...prev, { text: input, sender: "user" }]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
    try {
      const result = await chatSessionRef.current.sendMessage(currentInput);
      setMessages(prev => [...prev, { text: result.response.text(), sender: "ai" }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "⚠️ Response verify nahi hua. Dobara click karein.", sender: "ai", isError: true }]);
    } finally { setIsTyping(false); }
  };

  const styles = {
    appContainer: { backgroundColor: '#0b0f19', color: '#e5e7eb', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', overflow: 'hidden' },
    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', flexShrink: 0 },
    logoText: { fontSize: '18px', fontWeight: 'bold', color: '#6366f1' },
    chatWindow: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px', width: '100%', margin: '0 auto' },
    messageRow: (s) => ({ display: 'flex', justifyContent: s === 'user' ? 'flex-end' : 'flex-start', width: '100%' }),
    messageBubble: (s, e) => ({ padding: '12px 16px', borderRadius: '18px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.4', wordWrap: 'break-word', backgroundColor: e ? '#7f1d1d' : s === 'user' ? '#2563eb' : '#1f2937' }),
    inputContainer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#111827', borderTop: '1px solid #1f2937', maxWidth: '600px', width: '100%', margin: '0 auto', flexShrink: 0 },
    chatInput: { flex: 1, backgroundColor: '#1f2937', border: '1px solid #374151', padding: '12px 16px', borderRadius: '24px', color: '#fff', fontSize: '15px', outline: 'none' },
    btn: { background: 'none', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer', padding: '4px' },
    sendBtn: { backgroundColor: '#2563eb', border: 'none', color: 'white', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.navbar}>
        <button style={styles.btn}>◁</button>
        <div style={styles.logoText}>NOVA MIND AI</div>
        <button style={styles.btn}>⋮</button>
      </div>
      <div style={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.messageRow(msg.sender)}>
            <div style={styles.messageBubble(msg.sender, msg.isError)}>
              {msg.isImage ? <img src={msg.text} alt="img" style={{ maxWidth: '100%', borderRadius: '12px' }} /> : msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div style={styles.messageRow('ai')}><div style={{color: '#9ca3af', fontStyle: 'italic', fontSize: '14px'}}>Nova Mind soch raha hai...</div></div>}
        <div ref={chatEndRef} />
      </div>
      {editingImage && (
        <div style={{ position: 'fixed', top: '5%', left: '5%', right: '5%', bottom: '5%', backgroundColor: '#111827', border: '2px solid #6366f1', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 100, overflowY: 'auto' }}>
          <h3 style={{ color: '#6366f1' }}>Nova Photo Editor</h3>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #374151' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setFilter('none')} style={{ backgroundColor: '#1f2937', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none' }}>Normal</button>
            <button onClick={() => setFilter('grayscale')} style={{ backgroundColor: '#1f2937', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none' }}>B&W</button>
            <button onClick={() => setFilter('sepia')} style={{ backgroundColor: '#1f2937', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none' }}>Sepia</button>
            <button onClick={() => setFilter('blur')} style={{ backgroundColor: '#1f2937', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none' }}>Blur</button>
          </div>
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: 'auto' }}>
            <button onClick={() => setEditingImage(null)} style={{ flex: 1, padding: '10px', background: '#374151', color: '#fff', borderRadius: '8px', border: 'none' }}>Cancel</button>
            <button onClick={saveEditedImage} style={{ flex: 1, padding: '10px', background: '#6366f1', color: '#fff', borderRadius: '8px', border: 'none' }}>Done</button>
          </div>
        </div>
      )}
      <div style={styles.inputContainer}>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current.click()} style={styles.btn}>📷</button>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isListening ? "Bolte rahiye..." : "Ask anything..."} style={styles.chatInput} />
        <button onClick={startVoiceTyping} style={{ ...styles.btn, color: isListening ? '#ef4444' : '#9ca3af' }}>🎙️</button>
        <button onClick={handleSend} disabled={isTyping} style={styles.sendBtn}><span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>↑</span></button>
      </div>
    </div>
  );
}

