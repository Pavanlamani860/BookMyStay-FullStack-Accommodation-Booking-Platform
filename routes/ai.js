const express = require("express");
const router = express.Router();
const { generateDescription } = require("../utils/gemini");

// AI Description Generator
router.post("/ai/generate-description", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    const description = await generateDescription(req.body);

    console.log("AI RESPONSE:", description);

    res.json({ description });
  } catch (err) {
    console.log(err);
    if (err.status === 503) {
      return res.status(503).json({
        error: "AI service is temporarily unavailable. Please try again.",
      });
    }
    res.status(500).json({
      error: "AI generation failed",
    });
  }
});

module.exports = router;
