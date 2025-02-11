"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [scannedFoods, setScannedFoods] = useState([]);
  const [consumedMacros, setConsumedMacros] = useState({
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
  });

  // Fetch user data & food scan data
  useEffect(() => {
    async function fetchData() {
      try {
        async function fetchData() {
            try {
              const userRes = await axios.get("http://localhost:5001/api/user/me");  // Ensure correct API URL
              const foodRes = await axios.get("http://localhost:5001/api/foodScan");
          
              setUser(userRes.data);
              setScannedFoods(foodRes.data);
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          }
          

        // Calculate total consumed macros based on user food intake
        let totalProteins = 0,
          totalFats = 0,
          totalCarbs = 0;

        foodRes.data.forEach((food) => {
          totalProteins += food.consumption.consumedMacros.Proteins;
          totalFats += food.consumption.consumedMacros.Fats;
          totalCarbs += food.consumption.consumedMacros.Carbohydrates;
        });

        setConsumedMacros({
          proteins: totalProteins,
          fats: totalFats,
          carbohydrates: totalCarbs,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // Handle slider change & update DB
  const handleConsumptionChange = async (foodId, newPercentage) => {
    try {
      const food = scannedFoods.find((item) => item._id === foodId);
      if (!food) return;

      const updatedMacros = {
        Carbohydrates: (parseFloat(food.analysis.macros.Carbohydrates.quantity) * newPercentage) / 100,
        Fats: (parseFloat(food.analysis.macros.Fats.quantity) * newPercentage) / 100,
        Proteins: (parseFloat(food.analysis.macros.Proteins.quantity) * newPercentage) / 100,
      };

      await axios.put(`/api/foodScan/${foodId}`, {
        consumption: {
          status: "consumed",
          percentage: newPercentage,
          consumedMacros: updatedMacros,
        },
      });

      setScannedFoods((prevFoods) =>
        prevFoods.map((item) =>
          item._id === foodId ? { ...item, consumption: { ...item.consumption, percentage: newPercentage, consumedMacros: updatedMacros } } : item
        )
      );

      setConsumedMacros((prev) => ({
        proteins: prev.proteins + updatedMacros.Proteins,
        fats: prev.fats + updatedMacros.Fats,
        carbohydrates: prev.carbohydrates + updatedMacros.Carbohydrates,
      }));
    } catch (error) {
      console.error("Error updating consumption:", error);
    }
  };

  if (!user) return <p className="text-white mt-24">Loading...</p>;

  return (
    <div className="text-white mt-24 p-6">
      <h1 className="text-3xl font-bold">DASHBOARD</h1>

      {/* Macronutrient Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {["proteins", "fats", "carbohydrates"].map((macro) => (
          <div key={macro} className="flex flex-col items-center">
            <CircularProgressbar
              value={(consumedMacros[macro] / user.macronutrients[macro]) * 100}
              text={`${Math.round((consumedMacros[macro] / user.macronutrients[macro]) * 100)}%`}
            />
            <p className="text-lg mt-2">{macro.toUpperCase()}</p>
            <p>
              {Math.round(consumedMacros[macro])}g / {user.macronutrients[macro]}g
            </p>
          </div>
        ))}
      </div>

      {/* Food Consumption Sliders */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold">Scanned Foods</h2>
        <div className="mt-4">
          {scannedFoods.map((food) => (
            <div key={food._id} className="p-4 border border-gray-600 rounded-lg mb-4">
              <p className="text-lg font-semibold">{food.analysis.healthScore ? `Health Score: ${food.analysis.healthScore}` : "Food Item"}</p>
              <p className="text-sm text-gray-400">Carbs: {food.analysis.macros.Carbohydrates.quantity}g, Fats: {food.analysis.macros.Fats.quantity}g, Proteins: {food.analysis.macros.Proteins.quantity}g</p>

              {/* Consumption Slider */}
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={food.consumption.percentage}
                  className="w-full"
                  onChange={(e) => handleConsumptionChange(food._id, parseInt(e.target.value))}
                />
                <span>{food.consumption.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
