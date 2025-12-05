import { GoogleGenAI, Type } from "@google/genai";

// NOTA: En producción, esto debe venir del Backend para no exponer tu API Key.
// Por ahora, usa una variable de entorno o pega tu key temporalmente aquí.
const API_KEY = "TU_API_KEY_AQUI"; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateMenuItemDescription = async (itemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Escribe una descripción corta (max 15 palabras), apetitosa y vendedora para: "${itemName}".`,
    });
    return response.text || "";
  } catch (error) {
    console.error("IA Error:", error);
    return "Deliciosa opción de la casa.";
  }
};

export const suggestPriceAndTags = async (itemName: string): Promise<{ price: number, tags: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Sugiere un precio numérico (USD) y 3 etiquetas cortas para "${itemName}". Responde solo JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : { price: 10, tags: [] };
  } catch (error) {
    return { price: 0, tags: [] };
  }
};

// Placeholder para imagen (Imagen 3 requiere configuración extra, usaremos placeholder por ahora)
export const generateMenuImage = async (prompt: string): Promise<string | null> => {
    return null; 
};
export const editMenuImage = async (img: string, prompt: string): Promise<string | null> => {
    return null;
};