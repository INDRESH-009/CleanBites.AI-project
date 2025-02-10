// server/src/routes/chat.route.js

import express from "express";
import jwt from "jsonwebtoken"; // Make sure to install jsonwebtoken
import connectDB from "../config/db.js"; // Your DB connection helper
import FoodScan from "../models/foodScan.model.js";
import User from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini SDK

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Ensure DB connection
    await connectDB();

    const { message } = req.body;

    // Extract and verify JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.split(" ")[1]; // Assumes "Bearer <token>"
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Extract user ID from the decoded token (matching the JWT payload from auth routes)
    const userId = decoded.userId;

    // Retrieve the latest food scan for this user (sorted descending by createdAt)
    const latestScan = await FoodScan.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestScan) {
      return res.json({
        answer: "No food scan available in your history. Please scan a food image first.",
      });
    }

    // Retrieve the user's health profile
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ answer: "User not found." });
    }

    // Build a context string from the user's health details and latest food scan analysis.
    const healthDetails = user.healthDetails || {};
    const allergies = healthDetails.allergies ? healthDetails.allergies.join(", ") : "None";
    const medicalConditions = healthDetails.medicalConditions
      ? healthDetails.medicalConditions.join(", ")
      : "None";

    const context = `
User Health Profile:
- Age: ${healthDetails.age || "N/A"}
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

    // Determine dynamic instruction based on query content.
    // For recipe queries, instruct the model to produce a detailed recipe with clear formatting.
    // For detailed queries, instruct for a comprehensive answer.
    // Otherwise, default to a brief and direct answer.
    let instruction = "Provide a brief and direct answer.";
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("recipe") || lowerMessage.includes("how do i make")) {
      instruction = `Provide a detailed recipe including ingredients, quantities, and step-by-step preparation instructions tailored for a diabetic vegan diet.
Format the response as plain text with clear line breaks. 
Ensure that each ingredient appears on its own line and each instruction step is numbered on a separate line.
Do not use markdown symbols such as #, *, or -, and avoid producing one continuous line of text.`;
    } else if (lowerMessage.includes("explain in detail") || lowerMessage.includes("elaborate")) {
      instruction = "Provide a detailed and comprehensive answer.";
    }

    // Construct the full prompt with dynamic instructions:
    const prompt = `
Context (DO NOT include this context in your final answer):
${context}

User Query: ${message}

Instructions: ${instruction} Use the provided context to answer the query without reiterating the context details.
    `;

    console.log("🔹 Decoded User ID from Token:", decoded.userId);

    // Use the Gemini SDK to generate content
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.json({ answer });
  } catch (error) {
    console.error("Error in chat API:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
