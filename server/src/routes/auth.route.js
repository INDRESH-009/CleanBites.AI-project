import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; 
import authMiddleware from "../middleware/auth.middleware.js";
import { calculateHealthMetrics } from "../utils/calculateHealthMetrics.js";

const router = express.Router();

// ✅ Register User (Step 1: Basic Details)
router.post("/register-step1", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isHealthDetailsCompleted: false,  // ✅ Track signup progress
        });

        await newUser.save();
        res.status(201).json({ message: "Step 1 Completed! Proceed to Step 2", userId: newUser._id });

    } catch (error) {
        console.error("❌ Server Error in register-step1:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ Register User (Step 2: Store Health Details & Auto-Calculate Metrics)
// Register User (Step 2: Store Health Details & Auto-Calculate Metrics)
router.post("/register-step2", async (req, res) => {
    try {
      // Now including additional fields (dietaryPreferences, allergies, medicalConditions) if needed.
      const {
        userId,
        age,
        gender,
        weight,
        height,
        activityLevel,
        healthGoals,
        dietaryPreferences,
        allergies,
        medicalConditions,
      } = req.body;
  
      // Make sure all required fields are provided
      if (
        !userId ||
        !age ||
        !gender ||
        !weight ||
        !height ||
        !activityLevel ||
        !healthGoals ||
        !dietaryPreferences ||
        !allergies ||
        !medicalConditions
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Store Health Details (including additional fields)
      user.healthDetails = {
        age,
        gender,
        weight,
        height,
        activityLevel,
        healthGoals,
        dietaryPreferences,
        allergies,
        medicalConditions,
      };
      user.isHealthDetailsCompleted = true;
  
      // Auto-Calculate Metrics (BMI, BMR, TDEE, Macronutrients)
      const metrics = calculateHealthMetrics({ weight, height, age, gender, activityLevel });
      if (metrics) {
        user.bmi = metrics.bmi;
        user.bmr = metrics.bmr;
        user.tdee = metrics.tdee;
        user.macronutrients = metrics.macronutrients;
      }
  
      await user.save();
  
      // Generate a JWT token so the user is “logged in” immediately.
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      res.status(200).json({ message: "Signup completed successfully!", metrics, token, user });
    } catch (error) {
      console.error("❌ Server Error in register-step2:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  

// ✅ Login User
router.post("/login", async (req, res) => {
    try {
        console.log("🔹 Login Attempt Received:", req.body);

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User Not Found:", email);
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Invalid Password for:", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("✅ User Authenticated:", user.email);

        res.json({ token, user });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get User Profile (Fix Missing Metrics Automatically)
// ✅ Get User Profile (Force Metrics Update If Missing)
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        let user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Debugging: Log current stored metrics
        console.log("🛠 Checking stored user metrics:", {
            bmi: user.bmi,
            bmr: user.bmr,
            tdee: user.tdee,
            macronutrients: user.macronutrients
        });

        // ✅ Auto-Fix Metrics If Missing (Ensure values are not `undefined` or `null`)
        if (!user.bmi || !user.bmr || !user.tdee || !user.macronutrients) {
            console.log("⚠️ Missing metrics detected. Recalculating...");

            const metrics = calculateHealthMetrics({
                weight: user.healthDetails?.weight,
                height: user.healthDetails?.height,
                age: user.healthDetails?.age,
                gender: user.healthDetails?.gender,
                activityLevel: user.healthDetails?.activityLevel,
                healthGoals: user.healthDetails?.healthGoals
            });

            if (metrics) {
                user.bmi = metrics.bmi;
                user.bmr = metrics.bmr;
                user.tdee = metrics.tdee;
                user.macronutrients = metrics.macronutrients;

                // ✅ Force save to prevent re-triggering calculation
                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            bmi: metrics.bmi,
                            bmr: metrics.bmr,
                            tdee: metrics.tdee,
                            macronutrients: metrics.macronutrients
                        }
                    }
                );

                console.log("✅ Metrics successfully recalculated and saved:", metrics);
            }
        }

        res.json(user);
    } catch (err) {
        console.error("❌ Error fetching user profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ✅ Logout Route
router.post("/logout", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ message: `User ${user.name} logged out successfully` });
    } catch (error) {
        console.error("❌ Logout Error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
