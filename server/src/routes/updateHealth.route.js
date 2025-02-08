import express from "express";
import User from "../models/user.model.js";
import { calculateHealthMetrics } from "../utils/calculateHealthMetrics.js";

const router = express.Router();

// ✅ Update Health Details API (Now Includes Allergies & Medical Conditions)
router.post("/update-health", async (req, res) => {
    try {
        console.log("🔹 Update Health Request Received:", req.body);

        const { userId, age, weight, height, activityLevel, healthGoals, allergies, medicalConditions } = req.body;

        if (!userId) {
            console.error("❌ Missing User ID");
            return res.status(400).json({ error: "User ID is required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error(`❌ User not found: ${userId}`);
            return res.status(404).json({ error: "User not found." });
        }

        // ✅ Ensure that allergies and medical conditions are always arrays
        const formattedAllergies = Array.isArray(allergies) ? allergies : [];
        const formattedMedicalConditions = Array.isArray(medicalConditions) ? medicalConditions : [];

        // ✅ Store Updated Health Details (Now Includes Health Goal)
        user.healthDetails = {
            ...user.healthDetails,
            age,
            weight,
            height,
            activityLevel,
            healthGoals,
            allergies: formattedAllergies,
            medicalConditions: formattedMedicalConditions
        };

        // ✅ Ensure `gender` exists before calculating health metrics
        const gender = user.healthDetails.gender || "Male"; // Default to Male if missing

        // ✅ Send `healthGoals` to calculate macros properly
        const metrics = calculateHealthMetrics({ weight, height, age, gender, activityLevel, healthGoals });

        if (metrics) {
            user.bmi = metrics.bmi;
            user.bmr = metrics.bmr;
            user.tdee = metrics.tdee;
            user.macronutrients = metrics.macronutrients;
        } else {
            console.error("❌ Health metrics calculation failed");
            return res.status(500).json({ error: "Failed to calculate health metrics." });
        }

        // ✅ Ensure the fields are actually saved in MongoDB
        const updatedUser = await user.save();
        console.log("✅ Updated User Data:", updatedUser);

        res.status(200).json({ message: "Health details updated!", metrics });

    } catch (error) {
        console.error("❌ Internal Server Error in /update-health:", error);
        res.status(500).json({ error: "Internal server error.", details: error.message });
    }
});


export default router;
