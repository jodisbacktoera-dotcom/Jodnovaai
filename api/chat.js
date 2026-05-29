xport default async function handler(req, res) {
  // सिर्फ POST रिक्वेस्ट को अनुमति दें
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  try {
    // Vercel बैकएंड से सुरक्षित रूप से OpenRouter API को कॉल करें (CORS एरर नहीं आएगा)
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VITE_OPENROUTER_KEY}`,
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
          ...(history || []),
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ reply: "AI ने कोई जवाब नहीं दिया।" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ reply: "Backend error: कनेक्शन फेल हो गया।" });
  }
}

