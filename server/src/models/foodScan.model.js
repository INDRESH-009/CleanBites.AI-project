import mongoose from 'mongoose';
const foodScanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    extractedText: { type: String, required: true },

    // Processing Classification
    processed: { type: String, default: null }, // Example: "Ultra-Processed Food: NOVA 4"

    // Ingredients
    harmfulIngredients: [{ type: String }], // Example: ["Artificial Preservatives", "Trans Fats"]
    beneficialIngredients: [{ type: String }], // Example: ["Omega-3", "Dietary Fiber"]

    // Diet Compatibility
    suitableDiets: [{ type: String }], // Example: ["Vegan", "Keto"]
    notSuitableDiets: [{ type: String }], // Example: ["Gluten-Free", "Diabetic-Friendly"]

    // Macronutrient Breakdown (Score-Based)
    macroNutrientsScore: {
        Proteins: { type: Number, default: null },
        Carbohydrates: { type: Number, default: null },
        DietaryFiber: { type: Number, default: null },
        Sugars: { type: Number, default: null },
        Fats: { type: Number, default: null },
        SaturatedFats: { type: Number, default: null },
        TransFats: { type: Number, default: null },
        MonounsaturatedFats: { type: Number, default: null },
        PolyunsaturatedFats: { type: Number, default: null },
        Omega3FattyAcids: { type: Number, default: null },
        Omega6FattyAcids: { type: Number, default: null }
    },

    // Micronutrient Breakdown (Score-Based)
    microNutrientsScore: {
        VitaminA: { type: Number, default: null },
        VitaminE: { type: Number, default: null },
        VitaminK: { type: Number, default: null },
        B1: { type: Number, default: null },
        B2: { type: Number, default: null },
        B3: { type: Number, default: null },
        B5: { type: Number, default: null },
        B6: { type: Number, default: null },
        B9: { type: Number, default: null },
        Calcium: { type: Number, default: null },
        Iron: { type: Number, default: null },
        Magnesium: { type: Number, default: null },
        Potassium: { type: Number, default: null },
        Sodium: { type: Number, default: null },
        Zinc: { type: Number, default: null },
        Phosphorus: { type: Number, default: null },
        Selenium: { type: Number, default: null },
        Copper: { type: Number, default: null },
        Manganese: { type: Number, default: null }
    },

    // Overall Health Score
    healthScore: { type: Number, default: null },

    // Warnings & Alerts
    addictiveIngredients: [{ type: String }], // Example: ["Caffeine", "MSG"]
    hiddenSweeteners: [{ type: String }], // Example: ["High Fructose Corn Syrup", "Dextrose"]
    
    // Natural vs Artificial Ratio
    artificialVsNaturalRatio: {
        Natural: { type: Number, default: null },
        Artificial: { type: Number, default: null }
    },

    // Preservatives & Gut Health
    preservativesAnalysis: [{ type: String }], // Example: ["Sodium Benzoate - Can cause inflammation"]
    gutHealthImpact: { type: String, default: null }, // Example: "Moderate impact due to artificial sweeteners"

    // Shelf-Life & Freshness
    freshnessScore: { type: Number, default: null },

    // Ingredient Source
    ingredientSource: { type: String, default: null }, // Example: "GMO-Based"

    // Allergen Warnings
    allergenAlerts: [{ type: String }], // Example: ["Dairy", "Soy", "Gluten"]

    // Artificial Coloring & Dyes
    foodDyeWarning: [{ type: String }], // Example: ["Red 40 - Linked to hyperactivity"]

    // Comparison with a Healthier Alternative
    comparativeAnalysis: {
        Alternative: { type: String, default: null }, // Example: "Whole Wheat Bread instead of White Bread"
        Comparison: { type: String, default: null } // Example: "Contains 40% less sugar"
    },

    // Portion Size Impact
    portionImpact: { type: String, default: null }, // Example: "This contains sugar equal to 3 chocolate bars."

    // Suggested Smart Substitutes
    smartSubstitutes: [{ type: String }], // Example: ["Almond Butter instead of Peanut Butter"]

    // Environmental Impact
    environmentalImpact: {
        carbonFootprint: { type: String, default: null }, // Example: "Eating this is equivalent to driving 1.2km in a petrol car."
        sustainabilityScore: { type: Number, default: null } // Example: 80 (Out of 100)
    },

    // Actionable Steps
    actionableSteps: [{ type: String }], // Example: ["Reduce intake", "Switch to organic version"]

    createdAt: { type: Date, default: Date.now }
});

// Export the model using ES6
const FoodScan = mongoose.model('FoodScan', foodScanSchema);
export default FoodScan;