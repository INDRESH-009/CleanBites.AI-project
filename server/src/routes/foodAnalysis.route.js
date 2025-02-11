import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import FoodScan from '../models/foodScan.model.js';
import { updateFoodConsumption } from '../utils/consumptionTracker.js';

dotenv.config();

const router = express.Router();

// Endpoint for recommendation fetch based on user health details
router.post('/getRecommendations', async (req, res) => {
  const { healthDetails } = req.body; // healthDetails should be the user's health information

  const openAIRequestBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a health and nutrition assistant. Based on the health details, suggest foods that are beneficial and harmful ingredients to avoid."
      },
      {
        role: "user",
        content: JSON.stringify(healthDetails) // Health details to guide recommendations
      }
    ]
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', openAIRequestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Use the OpenAI API key from environment variables
      }
    });

    // Get the response content from OpenAI
    const recommendationsText = response.data.choices[0].message.content;

    // Split the response into two parts: Beneficial foods and Harmful ingredients
    const [foodRecommendations, harmfulIngredients] = recommendationsText.split("Harmful Ingredients to Avoid:");

    // Prepare the response as separate objects for food recommendations and harmful ingredients
    const result = {
      beneficialFoods: foodRecommendations.trim(),
      harmfulIngredients: harmfulIngredients ? harmfulIngredients.trim() : null
    };

    // Send separate results for beneficial foods and harmful ingredients
    res.json({ success: true, result });

  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    res.status(500).send('Error fetching recommendations');
  }
});

// Store food analysis data
router.get('/store-analysis', (req, res) => {
  res.send("This endpoint expects a POST request. Please send your data using POST.");
});

// Main analysis route (including consumption tracking)
router.post('/', async (req, res) => {
  try {
    // 1. Consumption Tracking Integration:
    if (req.body.consumptionResponse) {
      let consumptionData;
      if (typeof req.body.consumptionResponse === 'string') {
        try {
          consumptionData = JSON.parse(req.body.consumptionResponse);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format in consumptionResponse."
          });
        }
      } else {
        consumptionData = req.body.consumptionResponse;
      }
      const { foodScanId, consumed, percentage } = consumptionData;
      if (!foodScanId || typeof consumed === 'undefined') {
        return res.status(400).json({
          success: false,
          message: "Missing foodScanId or consumed flag in consumptionResponse."
        });
      }
      const updatedFoodScan = await updateFoodConsumption(
        foodScanId,
        consumed,
        consumed ? percentage : 0
      );
      return res.status(200).json({ success: true, foodScan: updatedFoodScan });
    }

    // 2. Otherwise, process the food analysis as before.
    const { userId, extractedText } = req.body;
    if (!userId || !extractedText) {
      return res.status(400).json({ success: false, message: "Missing userId or extractedText." });
    }

    // Fetch user health details from MongoDB.
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Extract health details from the user profile.
    const {
      age,
      gender,
      weight,
      height,
      activityLevel,
      medicalConditions,
      allergies,
      healthGoals
    } = user.healthDetails;

    const { bmi, bmr, tdee, macronutrients } = user;

    // OpenAI API Key.
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ success: false, message: "OpenAI API key is missing." });
    }

    // Construct the enhanced AI prompt
    const prompt = `
You are an expert AI food analysis assistant. Your task is to analyze the provided food label text and deliver an in-depth nutritional and environmental analysis that is personalized to the user’s health profile. Use scientifically accurate data and clear reasoning.

---------------------------
**User Profile:**
- **Name:** ${user.name}
- **Age:** ${age}
- **Gender:** ${gender}
- **Weight:** ${weight} kg
- **Height:** ${height} cm
- **Activity Level:** ${activityLevel}
- **Medical Conditions:** ${medicalConditions.length > 0 ? medicalConditions.join(", ") : "None"}
- **Allergies:** ${allergies.length > 0 ? allergies.join(", ") : "None"}
- **Health Goal:** ${healthGoals || "General Wellness"}

---------------------------
**User Health Metrics:**
- **BMI:** ${bmi.toFixed(2)}
- **BMR:** ${bmr.toFixed(2)} kcal/day
- **TDEE:** ${tdee.toFixed(2)} kcal/day
- **Daily Recommended Macronutrients:**
    - **Proteins:** ${macronutrients.proteins.toFixed(2)} g
    - **Fats:** ${macronutrients.fats.toFixed(2)} g
    - **Carbohydrates:** ${macronutrients.carbohydrates.toFixed(2)} g

---------------------------
**Food Product Details (Extracted Text):**
"""
${extractedText}
"""

---------------------------
**Analysis Requirements:**

1. **Calories:** Estimate the total calories per 100g.
2. **Processing Level:** Classify the product as Ultra-Processed, Minimally Processed, or according to NOVA classifications (1–4).
3. **Health Score:** Provide a score from 0–100 indicating the overall healthiness.
4. **Carbon Footprint:** Provide a detailed analogy, for example: "Eating this food is equivalent to driving a petrol car for X km." Do not leave placeholders.
5. **Sugar Content:** 
   - **Total Sugar:** Provide the total grams of sugar per 100g.
   - **Sugar Sources:** List the ingredients that contribute most significantly to the sugar content.
6. **Macronutrients:** For Carbohydrates, Fats, and Proteins, include:
   - **Quantity (grams per 100g)**
   - **Quality Score:** A rating from 0–10 reflecting the nutritional quality.
7. **Micronutrients:** List at least four key micronutrients present (e.g., Vitamin A, Vitamin C, Iron, Calcium).
8. **Harmful Ingredients:** Identify any potentially harmful ingredients. For each, provide not only the name but also a detailed explanation of how it affects the body and why it is harmful.
9. **Personalized Analysis:** Provide a personalized section that:
   - Addresses the user by name (e.g., "Dear ${user.name}, …").
   - Explains how the food might impact their specific health conditions.
   - Advises whether the food is suitable or not based on their profile.
   - For allergen warnings, if the user is allergic to any ingredient (e.g., nuts), warn about the presence of that allergen. Also, ensure that any healthier alternatives do not include the user’s allergens.
   - **Do not include nutrient budgeting details.**
10. **Healthier Alternatives:** Suggest up to three healthier alternatives with:
    - **Name**
    - **Health Score (0–100)**
    - **Reason for recommendation**
    - Make sure alternatives do not include any ingredients the user is allergic to.

---------------------------
**Return the analysis strictly as valid JSON matching the schema below (do not include any extra text or commentary):**

{
  "calories": "<Total Calories per 100g>",
  "processingLevel": "<Ultra-Processed, Minimally Processed, or NOVA classification (1-4)>",
  "healthScore": "<0-100>",
  "carbonFootprint": "<Full analogy as described (e.g., 'Eating this food is equivalent to driving a petrol car for X km')>",
  "sugarContent": {
    "totalSugar": "<grams>",
    "sugarSources": ["<ingredient1>", "<ingredient2>", "..."]
  },
  "macros": {
    "Carbohydrates": { "quantity": "<grams>", "score": "<0-10>" },
    "Fats": { "quantity": "<grams>", "score": "<0-10>" },
    "Proteins": { "quantity": "<grams>", "score": "<0-10>" }
  },
  "micros": ["<Micronutrient1>", "<Micronutrient2>", "<Micronutrient3>", "<Micronutrient4>"],
  "harmfulIngredients": [
    { "name": "<Ingredient Name>", "effect": "<Detailed explanation of the health impact>" }
  ],
  "personalizedAnalysis": {
    "medicalConditionImpact": { "riskMeter": "<low/medium/high>", "warning": "<Detailed personalized warning including the user's name and health conditions>" },
    "healthGoalImpact": { "impactSummary": "<Detailed explanation on how the food affects the user's health goals>", "goalAlignmentScore": "<0-100>" },
    "allergenWarnings": { "containsAllergens": "<yes/no>", "specificAllergens": ["<allergen1>", "<allergen2>"] },
    "goodAndBadEffects": { "pros": ["<pro1>", "<pro2>"], "cons": ["<con1>", "<con2>"] },
    "healthierAlternatives": [
      { "name": "<Alternative 1>", "healthScore": "<0-100>", "reason": "<Why it is a better option>" },
      { "name": "<Alternative 2>", "healthScore": "<0-100>", "reason": "<Why it is a better option>" },
      { "name": "<Alternative 3>", "healthScore": "<0-100>", "reason": "<Why it is a better option>" }
    ],
    "futureImpact": { "longTermEffect": "<Detailed long-term effect if eaten regularly>", "weightGainRisk": "<Estimated weight gain risk (e.g., +kg per month)>" }
  }
}
`;

    // Call OpenAI API
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
