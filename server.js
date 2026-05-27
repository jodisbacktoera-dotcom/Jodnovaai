import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyDk20kZW7ieRYssXRTgKJ6Mm72qNBFnqh0";
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" }); 

app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    const response = await model.generateContent({ contents: history });
    res.json({ text: response.response.text() });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("🚀 Nova Mind Advanced Backend active on port 5000"));

