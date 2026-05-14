import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
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
