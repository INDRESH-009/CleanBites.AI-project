import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isHealthDetailsCompleted: { type: Boolean, default: false },

    healthDetails: {
        age: { type: Number },
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        weight: { type: Number },
        height: { type: Number },
        activityLevel: { type: String, enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"] },
        allergies: [{ type: String }],  // stored as an array
        dietaryPreferences: { 
            type: String, 
            enum: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Other"] 
        },
        medicalConditions: [{ type: String }],  // stored as an array
        healthGoals: { 
            type: String, 
            enum: ["Weight Loss", "Muscle Gain", "General Wellness", "Low-Sodium Diet", "Heart Health", "Diabetes Management"] 
        },
    },

    bmi: { type: Number },
    bmr: { type: Number },
    tdee: { type: Number },
    macronutrients: {
        proteins: { type: Number },
        fats: { type: Number },
        carbohydrates: { type: Number }
    },
    // New fields for computed daily recommendations:
    recommendedSugarIntake: { type: Number },   // in grams per day
    recommendedSodiumIntake: { type: Number }     // in mg per day
}, { timestamps: true });

export default mongoose.model("User", userSchema);