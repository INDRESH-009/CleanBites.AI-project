import FoodScan from '../models/foodScan.model.js';

export async function updateFoodConsumption(foodScanId, consumed, percentage = 0) {
  // Retrieve the FoodScan record.
  const foodScan = await FoodScan.findById(foodScanId);
  if (!foodScan) {
    throw new Error("FoodScan record not found.");
  }

  let consumption = {};

  if (!consumed) {
    // User indicated NOT consuming the food.
    consumption = {
      status: "not consumed",
      percentage: 0,
      consumedMacros: {
        Carbohydrates: 0,
        Fats: 0,
        Proteins: 0,
      },
      sugarConsumed: 0,
    };
  } else {
    // User is consuming the food.
    consumption.status = "consumed";
    consumption.percentage = percentage;

    // Helper to safely parse a quantity string to a number and round to 2 decimals.
    const parseQuantity = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
    };

    // Assuming your analysis field stores macros as strings under these keys:
    const originalMacros = foodScan.analysis?.macros || {};
    const carbsTotal = parseQuantity(originalMacros?.Carbohydrates?.quantity);
    const fatsTotal = parseQuantity(originalMacros?.Fats?.quantity);
    const proteinsTotal = parseQuantity(originalMacros?.Proteins?.quantity);

    consumption.consumedMacros = {
      Carbohydrates: parseQuantity((carbsTotal * percentage) / 100),
      Fats: parseQuantity((fatsTotal * percentage) / 100),
      Proteins: parseQuantity((proteinsTotal * percentage) / 100),
    };

    // Properly track sugar content
    const sugarTotal = parseQuantity(
      foodScan.analysis?.sugarContent?.totalSugar ||
      foodScan.analysis?.macros?.Sugar?.quantity ||
      0
    );

    consumption.sugarConsumed = parseQuantity((sugarTotal * percentage) / 100);
  }

  // Save the consumption details in the FoodScan record.
  foodScan.consumption = consumption;
  await foodScan.save();
  return foodScan;
}
