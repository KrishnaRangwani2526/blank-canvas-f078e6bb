import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback checking to prevent crashes if key is somehow missing
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

/**
 * Utility to generate JSON structured output using Gemini.
 * We enforce returning a JSON string parsing.
 */
export async function generateJSONWithGemini(prompt: string): Promise<any> {
  if (!geminiModel) {
    throw new Error("Gemini API key is missing or invalid.");
  }
  
  const generationConfig = {
    temperature: 0.2, // Keep it low for structured data
    responseMimeType: "application/json",
  };

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw error;
  }
}

/**
 * Utility for general text/markdown generation using Gemini.
 */
export async function generateTextWithGemini(prompt: string): Promise<string> {
  if (!geminiModel) {
    throw new Error("Gemini API key is missing or invalid.");
  }

  const generationConfig = {
    temperature: 0.7,
  };

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw error;
  }
}
