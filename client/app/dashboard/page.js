"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [totalScans, setTotalScans] = useState(0);
  const [healthScore, setHealthScore] = useState("N/A");
  const [scannedFoods, setScannedFoods] = useState([]);
  const [consumedMacros, setConsumedMacros] = useState({
    Carbohydrates: 0,
    Fats: 0,
    Proteins: 0,
    Sugar: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("❌ No token or userId found. Redirecting to login...");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user details & all food scans
      const [userRes, foodRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/history`, { headers }),
      ]);

      if (!userRes.data) {
        console.error("❌ User data is missing!");
        return;
      }

      setUser(userRes.data);

      // Total Scans
      const scans = foodRes.data || [];
      setTotalScans(scans.length);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Filter today's food scans
      const todayScans = scans.filter(scan => 
        new Date(scan.createdAt).toISOString().split("T")[0] === today
      );

      setScannedFoods(todayScans);

      // Compute consumed macros for the day
      let totalCarbs = 0,
          totalFats = 0,
          totalProteins = 0,
          totalSugar = 0,
          totalHealthScore = 0,
          foodsEaten = 0;

      todayScans.forEach(food => {
        if (food.consumption?.status === "consumed") {
          totalCarbs += food.consumption?.consumedMacros?.Carbohydrates || 0;
          totalFats += food.consumption?.consumedMacros?.Fats || 0;
          totalProteins += food.consumption?.consumedMacros?.Proteins || 0;
          totalSugar += food.consumption?.sugarConsumed || 0;
          totalHealthScore += food.analysis?.healthScore || 0;
          foodsEaten++;
        }
      });

      // Calculate Health Score (Avg of consumed food health scores)
      if (foodsEaten > 0) {
        setHealthScore((totalHealthScore / foodsEaten).toFixed(2));
      }

      setConsumedMacros({
        Carbohydrates: parseFloat(totalCarbs.toFixed(2)),
        Fats: parseFloat(totalFats.toFixed(2)),
        Proteins: parseFloat(totalProteins.toFixed(2)),
        Sugar: parseFloat(totalSugar.toFixed(2)),
      });

    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  if (!user) return <p className="text-white mt-24">Loading...</p>;

  // Extract recommended macros from user data
  const dailyMacros = user.healthDetails?.dailyMacros || {
    Carbohydrates: 250,
    Fats: 80,
    Proteins: 100,
    Sugar: 50, // Assuming max sugar intake
  };

  return (
    <div className="text-white mt-24 p-6">
      <h1 className="text-3xl font-bold">DASHBOARD</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold">Health Score</h2>
          <p className="text-2xl font-bold">{healthScore}/100</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold">Total Scans</h2>
          <p className="text-2xl font-bold">{totalScans}</p>
        </div>
      </div>

      {/* Macronutrient Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {["Carbohydrates", "Fats", "Proteins", "Sugar"].map((macro) => (
          <div key={macro} className="flex flex-col items-center">
            <div style={{ width: 120, height: 120 }}>
              <CircularProgressbar
                value={(consumedMacros[macro] / dailyMacros[macro]) * 100}
                text={`${Math.round((consumedMacros[macro] / dailyMacros[macro]) * 100)}%`}
              />
            </div>
            <p className="text-lg mt-2">{macro.toUpperCase()}</p>
            <p>
              {Math.round(consumedMacros[macro])}g / {dailyMacros[macro]}g
            </p>
          </div>
        ))}
      </div>

      {/* Food Consumption History */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Today's Food Scans</h2>
        {scannedFoods.length === 0 ? (
          <p className="text-gray-400">No food scanned today.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {scannedFoods.map((food) => (
              <li key={food._id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-white">{food.analysis?.foodName || "Scanned Food"}</span>
                  <span className={`text-sm font-semibold ${food.consumption?.status === "consumed" ? "text-green-400" : "text-red-400"}`}>
                    {food.consumption?.status === "consumed" ? "Eaten ✅" : "Not Eaten ❌"}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">Scanned at: {new Date(food.createdAt).toLocaleTimeString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
