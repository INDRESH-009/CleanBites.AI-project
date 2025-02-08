export function calculateHealthMetrics({ weight, height, age, gender, activityLevel, healthGoals }) {
    if (!weight || !height || !age || !gender || !activityLevel || !healthGoals) return null;

    // ✅ BMI Calculation
    const bmi = weight / ((height / 100) * (height / 100));

    // ✅ BMR Calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === "Male") {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // ✅ TDEE Calculation (Based on Activity Level)
    const activityMultipliers = {
        "Sedentary": 1.2,
        "Lightly Active": 1.375,
        "Moderately Active": 1.55,
        "Very Active": 1.725
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    // ✅ Macronutrient Calculation Based on Health Goals
    let proteinFactor, fatFactor, carbFactor;

    if (healthGoals === "Weight Loss") {
        proteinFactor = 1.8;  // Higher protein for muscle preservation
        fatFactor = 0.8;
        carbFactor = 3.0;
    } else if (healthGoals === "Muscle Gain") {
        proteinFactor = 2.2;  // Higher protein for muscle building
        fatFactor = 1.2;
        carbFactor = 6.0;
    } else {
        // General Wellness
        proteinFactor = 1.6;
        fatFactor = 1.0;
        carbFactor = 4.5;
    }

    // ✅ Calculate Macros Scientifically
    const proteins = weight * proteinFactor;
    const fats = weight * fatFactor;
    const carbohydrates = weight * carbFactor;

    return { bmi, bmr, tdee, macronutrients: { proteins, fats, carbohydrates } };
}
