export function calculateHealthMetrics({
    weight,
    height,
    age,
    gender,
    activityLevel,
    healthGoals,
    medicalConditions = [],
    dietaryPreferences = "None"
  }) {
    if (!weight || !height || !age || !gender || !activityLevel || !healthGoals) return null;
  
    // --- BMI Calculation
    const bmi = weight / ((height / 100) ** 2);
  
    // --- BMR Calculation (Mifflin-St Jeor Equation)
    const bmr =
      gender === "Male"
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  
    // --- TDEE Calculation
    const activityMultipliers = {
      "Sedentary": 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
    // --- Macronutrient Calculation
    let proteinFactor, fatFactor, carbFactor;
    if (healthGoals === "Weight Loss") {
      proteinFactor = 1.8;
      fatFactor = 0.8;
      carbFactor = 3.0;
    } else if (healthGoals === "Muscle Gain") {
      proteinFactor = 2.2;
      fatFactor = 1.2;
      carbFactor = 6.0;
    } else {
      proteinFactor = 1.6;
      fatFactor = 1.0;
      carbFactor = 4.5;
    }
    const proteins = weight * proteinFactor;
    const fats = weight * fatFactor;
    const carbohydrates = weight * carbFactor;
  
    // Normalize medical conditions to lowercase for reliable comparison.
    const conditionsLower = medicalConditions.map(cond => cond.toLowerCase());
  
    // --- Intelligent Recommended Added Sugar Intake Calculation
    let sugarPercentage = (healthGoals === "Weight Loss") ? 0.05 : 0.10;
    if (conditionsLower.includes("diabetes") || conditionsLower.includes("diabetes management")) {
      sugarPercentage *= 0.8; // reduce by 20%
    }
    if (age >= 65) {
      sugarPercentage *= 0.9;
    }
    const recommendedSugarIntake = (tdee * sugarPercentage) / 4;
  
    // More intelligent sodium calculation:
let baseSodium = 2300; // mg for a 2000-calorie baseline diet.
let sodiumScaling = tdee / 2000;  // Scale based on the user's TDEE.
let recommendedSodiumIntake = baseSodium * sodiumScaling;

// Define a risk factor multiplier starting at 1.0 (no reduction)
let riskMultiplier = 1.0;
// Normalize the conditions array to lowercase


// Define risk conditions and subtract 0.15 for each risk factor present.
// For instance, if diabetes is present, subtract 0.15; if hypertension is present, subtract another 0.15.
// Ensure the multiplier does not go below 0.7 (i.e. maximum 30% reduction).
const riskConditions = ["diabetes", "diabetes management", "hypertension"];
riskConditions.forEach(cond => {
  if (conditionsLower.includes(cond)) {
    riskMultiplier -= 0.15;
  }
});
if (riskMultiplier < 0.7) {
  riskMultiplier = 0.7;
}
recommendedSodiumIntake *= riskMultiplier;

// Adjust further based on health goals.
// For Weight Loss, you might want to lower sodium further by 10%.
if (healthGoals === "Weight Loss") {
  recommendedSodiumIntake *= 0.9;
}

// Adjust for older adults (65+), but use a milder reduction (e.g., 5%).
if (age >= 65) {
  recommendedSodiumIntake *= 0.95;
}

recommendedSodiumIntake = Math.round(recommendedSodiumIntake);

    return {
      bmi,
      bmr,
      tdee,
      macronutrients: { proteins, fats, carbohydrates },
      recommendedSugarIntake,   // in grams per day
      recommendedSodiumIntake   // in mg per day
    };
  }
  