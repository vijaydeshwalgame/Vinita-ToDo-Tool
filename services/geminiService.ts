import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
    console.warn("API_KEY not set, AI features will be disabled.");
}

export const generateCozyRoutine = async (mood: string): Promise<string[]> => {
  if (!ai) return ["Make a cup of tea", "Read for 10 minutes", "Take a deep breath"];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a list of 3-5 simple, cozy, and achievable tasks for a "${mood}" vibe. Keep them short (under 6 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"tasks": []}');
    return data.tasks || [];
  } catch (error) {
    console.error("Failed to generate routine:", error);
    return ["Organize your desk", "Water the plants", "Listen to calm music"];
  }
};

export const generateEncouragement = async (completedTask: string): Promise<string> => {
    if (!ai) return "Great job! Keep it up.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user just completed the task: "${completedTask}". Write a very short, warm, cozy one-sentence congratulation (max 10 words).`,
        });
        return response.text?.trim() || "Wonderful progress!";
    } catch (error) {
        return "You are doing great!";
    }
}
