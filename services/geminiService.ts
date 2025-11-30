import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an image using NanoBanana (gemini-2.5-flash-image)
 */
export const generateCreativeImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    // Check for inline data (image) - iterate all parts as per new guidelines
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned from NanoBanana");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates text for the ad based on a topic or the image prompt.
 */
export const generateAdCopy = async (context: string): Promise<{ title: string; subtitle: string; body: string; cta: string }> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a marketing ad copy based on this context: "${context}". 
      Return JSON with keys: title (catchy, short), subtitle (explanatory, very short), body (persuasive, max 15 words), cta (call to action, 2-3 words).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
          },
          required: ["title", "subtitle", "body", "cta"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text generated");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating copy:", error);
    return {
      title: "FLASH SALE",
      subtitle: "Limited Time Only",
      body: "Don't miss out on these exclusive deals available for a short time.",
      cta: "SHOP NOW"
    };
  }
};