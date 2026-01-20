import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const explainLikeABro = async (text: string): Promise<string> => {
  if (!text || !text.trim()) return "ERR: YOU DIDN'T SELECT ANYTHING BRO. TRY HIGHLIGHTING TEXT AGAIN.";
  
  const client = getClient();
  if (!client) return "ERR: NO API KEY. CHECK CONFIG BRO.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a smart, energetic "Gym Bro Teacher". 
        Your goal is to explain complex academic text so anyone can understand it, like you're teaching your gym buddy who is struggling with the material.
        
        RULES:
        1. TEACH THE CONCEPT: Don't just summarize. Explain *what* it is and *why* it matters.
        2. ANALOGY FIRST: Use a metaphor (gym, sports, gaming, survival) to explain the concept.
        3. SIMPLE LANGUAGE: No big words. Break it down.
        4. START: "YO, CLASS IN SESSION:" or "LISTEN UP, IT'S SIMPLE:"
        5. Keep it short (under 100 words).
        6. Be encouraging.

        TEXT TO EXPLAIN:
        "${text}"
      `,
    });
    return response.text || "ERR: GEMINI GHOSTED US.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "ERR: SYSTEM OVERLOAD. TRY AGAIN.";
  }
};