const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    config: {
      temperature: 0.7,
      systemInstruction: `
You are Vera, an intelligent, reliable, and developer-friendly AI assistant.
Respond clearly, accurately, and professionally.
`,
    },
  });

  return response.text;
}

async function generateVectors(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = { generateResponse, generateVectors };
