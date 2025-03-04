// server/models/foodScan.model.js
import mongoose from 'mongoose';

const foodScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  
  // Existing analysis field…
  analysis: {
    calories: { type: String, default: null },
    processingLevel: { type: String, default: null },
    healthScore: { type: Number, default: null },
    carbonFootprint: { type: String, default: null },
    sugarContent: {
      totalSugar: { type: String, default: null },
      sugarSources: [{ type: String }]
    },
    macros: {
      Carbohydrates: {
        quantity: { type: String, default: null },
        score: { type: String, default: null }
      },
      Fats: {
        quantity: { type: String, default: null },
        score: { type: String, default: null }
      },
      Proteins: {
        quantity: { type: String, default: null },
        score: { type: String, default: null }
      }
    },
    harmfulIngredients: [{
      name: { type: String },
      effect: { type: String }
    }],
    personalizedAnalysis: {
      medicalConditionImpact: {
        riskMeter: { type: String, default: null },
        warning: { type: String, default: null }
      },
      healthGoalImpact: {
        impactSummary: { type: String, default: null },
        goalAlignmentScore: { type: String, default: null }
      },
      allergenWarnings: {
        containsAllergens: { type: String, default: null },
        specificAllergens: [{ type: String }]
      },
      goodAndBadEffects: {
        pros: [{ type: String }],
        cons: [{ type: String }]
      },
      healthierAlternatives: [{
        name: { type: String, default: null },
        healthScore: { type: String, default: null },
        reason: { type: String, default: null }
      }],
      futureImpact: {
        longTermEffect: { type: String, default: null },
        weightGainRisk: { type: String, default: null }
      }
    }
  },
  
  // NEW: Consumption details for the scanned food
  consumption: {
    status: { type: String, default: "pending" }, // e.g., "consumed" or "not consumed"
    percentage: { type: Number, default: 0 },
    consumedMacros: {
      Carbohydrates: { type: Number, default: 0 },
      Fats: { type: Number, default: 0 },
      Proteins: { type: Number, default: 0 }
    },
    sugarConsumed: { type: Number, default: 0 }
  },
  
  // createdAt field
  createdAt: { type: Date, default: Date.now }
});

const FoodScan = mongoose.model('FoodScan', foodScanSchema);
export default FoodScan;
