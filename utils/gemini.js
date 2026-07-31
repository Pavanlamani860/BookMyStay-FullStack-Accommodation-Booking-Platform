const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateDescription(data) {
  const prompt = `
Generate a professional Airbnb-style listing description.

Title: ${data.title}
Location: ${data.location}
Category: ${data.category}
Amenities: ${data.amenities}

Make it attractive, short and natural.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  console.log("AI TEXT:", response.text);

  return response.text;
}

module.exports = { generateDescription };
