
import { GoogleGenAI, Type } from "@google/genai";
import { MoodType, MoodInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMoodInsights(mood: MoodType, note: string): Promise<MoodInsights> {
  const prompt = `The user is feeling ${mood}. 
  User's personal note: "${note || "No note provided."}"
  
  Please provide:
  1. A short, empathetic summary of their current state.
  2. 3 actionable tips or tricks to help them navigate their day or improve their mental wellbeing based on this specific mood.
  
  Be supportive, kind, and professional. Return the response in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A short empathetic summary",
            },
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { 
                    type: Type.STRING,
                    description: "One of: activity, reflection, social, wellness"
                  },
                },
                required: ["title", "description", "category"],
              },
            },
          },
          required: ["summary", "tips"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MoodInsights;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "I'm here for you. Taking a moment to acknowledge how you feel is the first step.",
      tips: [
        { title: "Breathe Deeply", description: "Take 5 deep breaths, focusing only on the air entering and leaving your body.", category: "wellness" },
        { title: "Small Win", description: "Complete one tiny task you've been putting off to feel a sense of accomplishment.", category: "activity" },
        { title: "Hydrate", description: "Drink a glass of water. It's a simple act of self-care.", category: "wellness" }
      ]
    };
  }
}
