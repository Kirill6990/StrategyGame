require('dotenv').config();
console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
const { GoogleGenAI } = require('@google/genai');
async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hello' });
    console.log(response.text);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
