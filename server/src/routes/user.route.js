import express from "express";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const router = express.Router();

// ✅ Fetch User Profile with Better Debugging
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`🔍 Incoming API request for user ID: ${userId}`);

        // ✅ Check if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error(`❌ Invalid MongoDB ObjectId format: ${userId}`);
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error(`❌ User not found in MongoDB: ${userId}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`✅ Found user: ${user.name}`);
        res.json(user);

    } catch (error) {
        console.error("❌ Unexpected server error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ Update Health Details
router.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { age, gender, weight, height, activityLevel, dietaryPreferences, healthGoals } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.healthDetails = {
            age,
            gender,
            weight,
            height,
            activityLevel,
            dietaryPreferences,
            healthGoals,
        };

        await user.save();

        res.json({ message: "Profile updated successfully", user });

    } catch (error) {
        console.error("❌ Error updating user profile:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;








