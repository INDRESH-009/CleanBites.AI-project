import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isHealthDetailsCompleted: { type: Boolean, default: false },

    healthDetails: {
        age: { type: Number, required: false },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: false },
        weight: { type: Number, required: false },
        height: { type: Number, required: false },
        activityLevel: { type: String, enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], required: false },
        allergies: [{ type: String }],  // ✅ Now properly stored as an array
        dietaryPreferences: { type: String, enum: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo", "Other"], required: false },
        medicalConditions: [{ type: String }],  // ✅ Now properly stored as an array
        healthGoals: { type: String, enum: ["Weight Loss", "Muscle Gain", "General Wellness", "Low-Sodium Diet", "Heart Health", "Diabetes Management"], required: false },
    },

    bmi: { type: Number },
    bmr: { type: Number },
    tdee: { type: Number },
    macronutrients: {
        proteins: { type: Number },
        fats: { type: Number },
        carbohydrates: { type: Number }
    }
}, { timestamps: true });




export default mongoose.model("User", userSchema);
