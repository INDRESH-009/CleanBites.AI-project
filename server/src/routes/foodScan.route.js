import express from 'express';
import FoodScan from '../models/foodScan.model.js';
import User from '../models/user.model.js';
import upload from '../middleware/image_upload.middleware.js';

const router = express.Router();

// Function to remove empty micronutrient values
const cleanMicronutrientData = (microNutrients) => {
    return Object.fromEntries(
        Object.entries(microNutrients).filter(([_, value]) => value !== null && value !== 0)
    );
};

// Save Food Scan & Link to User
router.post('/scan', async (req, res) => {
    try {
        const { userId, foodDetails, imageUrl, analysis } = req.body;

        const newScan = new FoodScan({
            userId,
            foodDetails,
            imageUrl,
            analysis,
        });

        const savedScan = await newScan.save();

        // Add scan to user's profile
        await User.findByIdAndUpdate(userId, {
            $push: { foodScans: savedScan._id },
        }, { new: true });

        res.status(201).json(savedScan);
    } catch (error) {
        res.status(500).json({ error: "Failed to save food scan." });
    }
});

router.post('/store-analysis', upload.single('foodImage'), async (req, res) => {
    try {
        console.log("Request received:", req.body);
        console.log("Uploaded file details:", req.file);

        if (!req.file) {
            return res.status(400).json({ success: false, message: "File upload failed. Check Cloudinary settings." });
        }

        const { userId, extractedText, analysisData } = req.body;
        const imageUrl = req.file.path; // Cloudinary URL

        if (!analysisData) {
            return res.status(400).json({ success: false, message: "Missing analysisData. Ensure it's properly sent in request." });
        }

        let parsedAnalysis;
        try {
            parsedAnalysis = JSON.parse(analysisData);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid JSON format in analysisData", error: err.message });
        }

        // Clean micronutrient data before saving
        if (parsedAnalysis.microNutrients) {
            parsedAnalysis.microNutrients = cleanMicronutrientData(parsedAnalysis.microNutrients);
        }

        const newFoodScan = new FoodScan({
            userId,
            imageUrl,
            extractedText,
            ...parsedAnalysis
        });

        const savedScan = await newFoodScan.save();

        // Add scan to user's profile efficiently
        await User.findByIdAndUpdate(userId, {
            $push: { foodScans: savedScan._id },
        }, { new: true }).select("_id foodScans");

        res.status(201).json({ success: true, message: "Food scan stored successfully!", foodScan: savedScan });
    } catch (error) {
        console.error("❌ Error storing food scan:", error);
        res.status(500).json({ success: false, message: "Error storing food scan", error: error.message });
    }
});

export default router;
