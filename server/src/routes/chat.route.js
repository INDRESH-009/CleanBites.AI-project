import express from "express";
import jwt from "jsonwebtoken";
import connectDB from "../config/db.js";
import FoodScan from "../models/foodScan.model.js";
import User from "../models/user.model.js";

// Import the default export from the OpenAI package (v4 uses a new API)
import OpenAI from "openai";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectDB();

    const { message } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const userId = decoded.userId;

    const latestScan = await FoodScan.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestScan) {
      return res.json({
        answer: "No food scan available in your history. Please scan a food image first.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ answer: "User not found." });
    }

    // Build a context string using the user's health details and the latest food scan analysis.
    const healthDetails = user.healthDetails || {};
    const allergies = healthDetails.allergies ? healthDetails.allergies.join(", ") : "None";
    const medicalConditions = healthDetails.medicalConditions
      ? healthDetails.medicalConditions.join(", ")
      : "None";

    const context = `
User Health Profile:
- Age: ${healthDetails.age || "N/A"}
- Name: ${user.name || "User"}
- Gender: ${healthDetails.gender || "N/A"}
- Weight: ${healthDetails.weight || "N/A"} kg
- Height: ${healthDetails.height || "N/A"} cm
- Activity Level: ${healthDetails.activityLevel || "N/A"}
- Allergies: ${allergies}
- Medical Conditions: ${medicalConditions}
- Dietary Preferences: ${healthDetails.dietaryPreferences || "N/A"}

Latest Food Scan Analysis:
- Calories: ${latestScan.analysis.calories || "N/A"}
- Processing Level: ${latestScan.analysis.processingLevel || "N/A"}
- Health Score: ${latestScan.analysis.healthScore || "N/A"}
- Carbon Footprint: ${latestScan.analysis.carbonFootprint || "N/A"}
- Sugar Content: ${latestScan.analysis.sugarContent?.totalSugar || "N/A"} g 
  (Sources: ${(latestScan.analysis.sugarContent?.sugarSources || []).join(", ") || "N/A"})
- Macros: 
   • Carbohydrates: ${latestScan.analysis.macros?.Carbohydrates?.quantity || "N/A"}g 
     (Score: ${latestScan.analysis.macros?.Carbohydrates?.score || "N/A"})
   • Fats: ${latestScan.analysis.macros?.Fats?.quantity || "N/A"}g 
     (Score: ${latestScan.analysis.macros?.Fats?.score || "N/A"})
   • Proteins: ${latestScan.analysis.macros?.Proteins?.quantity || "N/A"}g 
     (Score: ${latestScan.analysis.macros?.Proteins?.score || "N/A"})
- Personalized Analysis: ${latestScan.analysis.personalizedAnalysis ? JSON.stringify(latestScan.analysis.personalizedAnalysis) : "N/A"}
    `;

    // Detailed instructions for the chatbot.
    // These instructions aim to produce responses that are personalized, clear, non-redundant, and well-formatted.
    const detailedInstructions = `
You are HealthBuddy, a friendly and empathetic chatbot that provides personalized dietary advice based on the user's health profile and food scan analysis. Your responsibilities include:
- Providing precise guidance on safe portion sizes and macro breakdowns when asked.
- Advising, for example, that if a food is not strictly contraindicated, a safe portion might be half of a standard serving. 
- Explaining any analysis terms or ingredient effects in plain, easy-to-understand language.
- If a user asks for healthy alternatives or recipes, provide a unique, well-formatted list using bullet points (each bullet should start on a new line with a clear line break after it), but do not repeat the same list if it has already been mentioned in a previous reply.
- Vary how you reference the user's name (if provided) to keep the conversation natural.
- Respond directly to the user’s specific question. For instance, if the query is about portion size or macros, focus solely on that without redundantly including healthy alternative suggestions unless explicitly asked.
- Ensure your response is clear, actionable, and supportive.

Remember:
- Do not include the full context in your final answer.
- Personalize your response by addressing the user by name occasionally.
- Use bullet points with line breaks when listing items.
- Avoid redundant repetition of healthy alternatives in each reply.

Answer the user's query based solely on the provided context and these instructions.
    `;

    const prompt = `
Context (DO NOT include this context in your final answer):
${context}

User Query: ${message}

Instructions: ${detailedInstructions}
    `;

    console.log("🔹 Decoded User ID from Token:", decoded.userId);

    // Initialize the OpenAI client using the new v4 API syntax.
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use the Chat Completion API with GPT-3.5-turbo.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content.trim();

    return res.json({ answer });
  } catch (error) {
    console.error("Error in chat API:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;