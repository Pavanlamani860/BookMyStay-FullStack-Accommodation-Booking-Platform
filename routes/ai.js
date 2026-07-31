const express = require("express");
const router = express.Router();
const { generateDescription } = require("../utils/gemini");

// AI Description Generator
router.post("/ai/generate-description", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body); // ⭐ ADD THIS

    const description = await generateDescription(req.body);

    console.log("AI RESPONSE:", description); // ⭐ ADD THIS

    res.json({ description });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;
