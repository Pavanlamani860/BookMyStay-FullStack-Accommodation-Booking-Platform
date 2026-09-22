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
  Make it attractive, short and natural 2 lines only.
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      console.log("AI TEXT:", response.text);
      return response.text;
    } catch (err) {
      console.log(`Gemini attempt ${attempt} failed:`, err.status);

      // Retry only for temporary server/unavailable errors
      if (err.status === 503 && attempt < 3) {
        console.log("Retrying Gemini...");
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        continue;
      }

      throw err;
    }
  }
}

module.exports = { generateDescription };
