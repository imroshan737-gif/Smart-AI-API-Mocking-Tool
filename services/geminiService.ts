import { GoogleGenAI, Type } from "@google/genai";
import { MockEndpoint } from "../types";

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJson = (text: string) => {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean;
};

export const generateMockData = async (
  prompt: string,
  mode: 'swagger' | 'description'
): Promise<Partial<MockEndpoint>> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing from environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert Backend Engineer and API Architect. 
    Your goal is to generate realistic mock API endpoints based on user input.
    
    Rules:
    1. If the input is Swagger/OpenAPI, parse the first endpoint you find.
    2. If the input is a description, invent a RESTful structure.
    3. Ensure sensitive data (passwords, tokens) are realistic but fake/masked.
    4. Provide a realistic JSON response body.
    5. Suggest a path and method.
  `;

  // Define the schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "A short descriptive name for the endpoint" },
      path: { type: Type.STRING, description: "The URL path, e.g., /api/v1/users" },
      method: { type: Type.STRING, description: "HTTP Method (GET, POST, etc.)" },
      description: { type: Type.STRING, description: "What this endpoint does" },
      responseBody: { 
        type: Type.OBJECT, 
        description: "The JSON response object", 
        properties: {}, // Allow any structure
        additionalProperties: true
      },
      statusCode: { type: Type.INTEGER, description: "Suggested HTTP status code" },
      tags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Categories for this endpoint" 
      }
    },
    required: ["name", "path", "method", "responseBody", "statusCode"]
  };

  const model = "gemini-2.5-flash"; // Using fast model for responsiveness

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a mock API configuration for the following request/spec: \n\n ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Keep it relatively deterministic but creative for data
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(cleanJson(text));
    
    // Default delay to random realistic value if not generated (schema doesn't ask for it to save tokens)
    return {
      ...parsed,
      delayMs: Math.floor(Math.random() * 300) + 50, 
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate mock data. Please check your API key and try again.");
  }
};