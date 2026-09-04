import { GoogleGenAI } from '@google/genai';

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found!");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello'
    });
    console.log("Response:", response.text);
  } catch (err: any) {
    console.error("Error listing models:", err.message || err);
  }
}

main();
