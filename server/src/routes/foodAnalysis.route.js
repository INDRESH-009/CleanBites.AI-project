import express from 'express';
import axios from 'axios';
import User from '../models/user.model.js'; 
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { userId, extractedText } = req.body;

        if (!userId || !extractedText) {
            return res.status(400).json({ success: false, message: "Missing userId or extractedText." });
        }

        // ✅ Fetch user health details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // ✅ OpenAI API Key
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            return res.status(500).json({ success: false, message: "OpenAI API key is missing." });
        }

        // ✅ Construct OpenAI Prompt
        const prompt = `
        You are an AI food analysis assistant specializing in **Indian food products**. 
        Your job is to analyze food ingredients based on the **user’s health profile** 
        and provide a **structured JSON response**. Use verified sources (FSSAI, ICMR, WHO, FDA).

        ---
        ## **👤 User Profile**
        - **Name:** ${user.name}
        - **Age:** ${user.healthDetails.age}
        - **Gender:** ${user.healthDetails.gender}
        - **Medical Conditions:** ${user.healthDetails.medicalConditions.join(", ") || "None"}
        - **Allergies:** ${user.healthDetails.allergies.join(", ") || "None"}
        - **Health Goal:** ${user.healthDetails.healthGoals || "General Wellness"}

        ---
        ## **🛒 Extracted Food Product Text**
        """
        ${extractedText}
        """

        ---
        ## **🔍 Expected JSON Output**
        {
            "calories": "<Total Calories per 100g>",
            "processingLevel": "<Ultra-Processed, Minimally Processed, NOVA 1-4>",
            "healthScore": "<0-100>",
            "carbonFootprint": "<Environmental impact in km driven equivalent>",
            "sugarContent": {
                "totalSugar": "<Total Sugar in grams>",
                "sugarSources": ["<Ingredients contributing to sugar>"]
            },
            "macros": {
                "Carbohydrates": { "quantity": "<grams>", "score": "<0-10>" },
                "Fats": { "quantity": "<grams>", "score": "<0-10>" },
                "Proteins": { "quantity": "<grams>", "score": "<0-10>" }
            },
            "micros": ["Vitamin A", "Vitamin C", "Iron", "Calcium"],
            "harmfulIngredients": [
                {
                    "name": "<Ingredient Name>",
                    "effect": "<Brief about its harmful impact>"
                }
            ],
            "personalizedSuggestions": [
                "Point 1: Impact on health goal - ${user.healthDetails.healthGoals}",
                "Point 2: Good and bad effects of consuming this food",
                "Point 3: Alternative healthier options"
            ]
        }

        **Return strictly in JSON format. Do NOT add any extra text.**
        `;

        // ✅ Call OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: prompt }],
                max_tokens: 1500
            },
            {
                headers: {
                    "Authorization": `Bearer ${openaiApiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        let analysisResult;
        try {
            analysisResult = JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            return res.status(500).json({ success: false, message: "Error parsing AI response.", error: error.message });
        }

        res.status(200).json({ success: true, analysis: analysisResult });

    } catch (error) {
        console.error("❌ Error in food analysis:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Error analyzing food product", error: error.message });
    }
});

export default router;
