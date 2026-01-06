
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCaptionFromImage = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Generate a creative, short, and engaging Instagram-style caption for this image. Use relevant hashtags." }
        ]
      }
    });
    return response.text || "Just another amazing moment. ✨";
  } catch (error) {
    console.error("Gemini Caption Error:", error);
    return "Beautiful view today! 📸";
  }
};

export const analyzePostVibe = async (base64Image: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Describe the 'Aura' or 'Vibe' of this image in exactly 2-3 words. For example: 'Cosmic Calm' or 'Urban Grit'." }
        ]
      }
    });
    return response.text?.trim() || "Neutral";
  } catch (error) {
    return "Unknown Vibe";
  }
};

export const generatePostImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const searchPostsWithAI = async (query: string, posts: any[]): Promise<any[]> => {
  try {
    const postSummaries = posts.map(p => ({ id: p.id, caption: p.caption, vibe: p.aiVibe }));
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search Query: "${query}"\nPosts: ${JSON.stringify(postSummaries)}\nWhich post IDs best match this query? Return only a comma-separated list of IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"matches": []}');
    return posts.filter(p => result.matches.includes(p.id));
  } catch (error) {
    return posts.filter(p => p.caption.toLowerCase().includes(query.toLowerCase()));
  }
};
