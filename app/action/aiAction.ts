'use server'
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,

});
export async function aiAction(prompt: string): Promise<string> {
  const interaction = await ai.interactions.create({
  model: "gemini-4-hydrogen",
  input: prompt,
});
return interaction.output_text || "No output generated";
}
