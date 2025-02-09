// app/api/chat/route.js

import { NextResponse } from "next/server";
import axios from "axios";
import jwt from "jsonwebtoken"; // Make sure to install jsonwebtoken
import connectDB from "../config/db.js"; // Make sure you have a helper for DB connection
import FoodScan from "../models/foodScan.model.js";
import User from "../models/user.model.js";

export async function POST(request) {
  try {
    // Ensure DB connection
    await connectDB();

    const { message } = await request.json();

    // Extract and verify JWT from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1]; // Assumes "Bearer <token>"
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Extract user ID from the decoded token (adjust the property name if needed)
    const userId = decoded.id;

    // Retrieve the latest food scan for this user (sorted descending by createdAt)
    const latestScan = await FoodScan.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestScan) {
      return NextResponse.json({
        answer: "No food scan available in your history. Please scan a food image first.",
      });
    }

    // Retrieve the user's health profile
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ answer: "User not found." });
    }

    // Build a context string from the user's health details and latest food scan analysis.
    const healthDetails = user.healthDetails || {};
    const allergies = healthDetails.allergies ? healthDetails.allergies.join(", ") : "None";
    const medicalConditions = healthDetails.medicalConditions
      ? healthDetails.medicalConditions.join(", ")
      : "None";

    const context = `
      Health Profile: Age: ${healthDetails.age || "N/A"}, Gender: ${healthDetails.gender || "N/A"}, Weight: ${healthDetails.weight || "N/A"} kg, Height: ${healthDetails.height || "N/A"} cm, Activity Level: ${healthDetails.activityLevel || "N/A"}, Allergies: ${allergies}, Medical Conditions: ${medicalConditions}, Dietary Preferences: ${healthDetails.dietaryPreferences || "N/A"}.
      Latest Food Scan Analysis: 
        - Calories: ${latestScan.analysis.calories || "N/A"}
        - Processing Level: ${latestScan.analysis.processingLevel || "N/A"}
        - Health Score: ${latestScan.analysis.healthScore || "N/A"}
        - Carbon Footprint: ${latestScan.analysis.carbonFootprint || "N/A"}
        - Sugar Content: ${latestScan.analysis.sugarContent?.totalSugar || "N/A"} g, Sources: ${(latestScan.analysis.sugarContent?.sugarSources || []).join(", ") || "N/A"}
        - Macros: Carbohydrates: ${latestScan.analysis.macros?.Carbohydrates?.quantity || "N/A"}g (Score: ${latestScan.analysis.macros?.Carbohydrates?.score || "N/A"}), Fats: ${latestScan.analysis.macros?.Fats?.quantity || "N/A"}g (Score: ${latestScan.analysis.macros?.Fats?.score || "N/A"}), Proteins: ${latestScan.analysis.macros?.Proteins?.quantity || "N/A"}g (Score: ${latestScan.analysis.macros?.Proteins?.score || "N/A"}).
        - Personalized Analysis: ${latestScan.analysis.personalizedAnalysis ? JSON.stringify(latestScan.analysis.personalizedAnalysis) : "N/A"}.
    `;

    // Construct the full prompt by appending the user's query.
    const prompt = `
      ${context}
      User Query: ${message}.
      Provide a detailed and personalized response based on the above context.
    `;

    // Call the Gemini API (adjust endpoint and payload as required)
    const geminiEndpoint = process.env.GEMINI_API_ENDPOINT || "https://api.gemini.example.com/v1/chat";
    const geminiApiKey = process.env.GEMINI_API_KEY || "your_gemini_api_key";

    const response = await axios.post(
      geminiEndpoint,
      { prompt, max_tokens: 200 },
      {
        headers: {
          Authorization: `Bearer ${geminiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer =
      response.data.answer || response.data.response || response.data.text || "No answer provided.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
