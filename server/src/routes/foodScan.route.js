// server/src/routes/foodScan.route.js

import express from 'express';
import FoodScan from '../models/foodScan.model.js';
import User from '../models/user.model.js';
import conditionalUpload from '../middleware/image_upload.middleware.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { updateFoodConsumption } from '../utils/consumptionTracker.js';

const router = express.Router();

// Helper: Remove empty micronutrient values
const cleanMicronutrientData = (microNutrients) => {
  return Object.fromEntries(
    Object.entries(microNutrients).filter(([_, value]) => value !== null && value !== 0)
  );
};

// ----------------------------------------------------------------------------
// Endpoint: Save Food Scan (No file upload)
// ----------------------------------------------------------------------------
router.post('/scan', async (req, res) => {
  try {
    const { userId, foodDetails, imageUrl, analysis, extractedText } = req.body;

    // If desired, you can set extractedText from foodDetails or another field.
    const newScan = new FoodScan({
      userId,
      foodDetails,
      imageUrl,
      extractedText, // Provided in the request body
      analysis,
    });

    const savedScan = await newScan.save();

    // Link the scan to the user's profile.
    await User.findByIdAndUpdate(
      userId,
      { $push: { foodScans: savedScan._id } },
      { new: true }
    );

    res.status(201).json(savedScan);
  } catch (error) {
    console.error("❌ Error saving scan:", error);
    res.status(500).json({ error: "Failed to save food scan." });
  }
});

// ----------------------------------------------------------------------------
// Endpoint: Store Analysis
//
// This endpoint handles two types of requests:
// 1. If the body contains a `consumptionResponse` key, it performs a consumption update.
// 2. Otherwise, it expects a file upload (via multipart/form-data) and stores a new scan.
// ----------------------------------------------------------------------------
router.post('/store-analysis', conditionalUpload, async (req, res) => {
  try {
    // --- Branch 1: Consumption Update ---
    if (req.body.consumptionResponse) {
      let consumptionData;
      if (typeof req.body.consumptionResponse === 'string') {
        try {
          consumptionData = JSON.parse(req.body.consumptionResponse);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format in consumptionResponse.",
            error: e.message,
          });
        }
      } else {
        consumptionData = req.body.consumptionResponse;
      }

      const { foodScanId, consumed, percentage } = consumptionData;
      if (!foodScanId || typeof consumed === 'undefined') {
        return res.status(400).json({
          success: false,
          message: "Missing foodScanId or consumed flag in consumptionResponse.",
        });
      }

      // Update the FoodScan record with consumption details.
      const updatedFoodScan = await updateFoodConsumption(
        foodScanId,
        consumed,
        consumed ? percentage : 0
      );
      return res.status(200).json({ success: true, foodScan: updatedFoodScan });
    }

    // --- Branch 2: File Upload for Storing Scan Analysis ---
    console.log("Request received:", req.body);
    console.log("Uploaded file details:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File upload failed. Check Cloudinary settings.",
      });
    }

    const { userId, extractedText, analysisData } = req.body;
    const imageUrl = req.file.path; // Cloudinary URL

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        message: "Missing analysisData. Ensure it's properly sent in request.",
      });
    }

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisData);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in analysisData",
        error: err.message,
      });
    }

    // Clean micronutrient data before saving, if present.
    if (parsedAnalysis.microNutrients) {
      parsedAnalysis.microNutrients = cleanMicronutrientData(parsedAnalysis.microNutrients);
    }

    const newFoodScan = new FoodScan({
      userId,
      imageUrl,
      analysis: parsedAnalysis,
    });

    const savedScan = await newFoodScan.save();

    // Efficiently add the new scan to the user's profile.
    await User.findByIdAndUpdate(
      userId,
      { $push: { foodScans: savedScan._id } },
      { new: true }
    ).select("_id foodScans");

    res.status(201).json({
      success: true,
      message: "Food scan stored successfully!",
      foodScan: savedScan,
    });
  } catch (error) {
    console.error("❌ Error storing food scan:", error);
    res.status(500).json({
      success: false,
      message: "Error storing food scan",
      error: error.message,
    });
  }
});

// ----------------------------------------------------------------------------
// Endpoint: Get Food Scan History for a User
// ----------------------------------------------------------------------------
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // The auth middleware sets req.user.userId.
    const userId = req.user.userId;
    // Find all scans for the user, sorted by creation date (most recent first).
    const scans = await FoodScan.find({ userId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (error) {
    console.error("❌ Error fetching food scan history:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/", authMiddleware, async (req, res) => {
    try {
      const foods = await FoodScan.find({ userId: req.user.id });
      res.json(foods);
    } catch (err) {
      res.status(500).json({ error: "Error fetching food scans" });
    }
  });
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { consumption } = req.body;
      const updatedFood = await FoodScan.findByIdAndUpdate(req.params.id, { consumption }, { new: true });
      res.json(updatedFood);
    } catch (err) {
      res.status(500).json({ error: "Error updating food consumption" });
    }
  });
    
export default router;
