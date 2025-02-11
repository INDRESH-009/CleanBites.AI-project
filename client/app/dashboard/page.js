"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Apple, HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  // State variables
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
  const [chartData, setChartData] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch user details and food scan history
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("❌ No token or userId found. Redirecting to login...");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, foodRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${userId}`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/history`, { headers }),
      ]);

      if (!userRes.data) {
        console.error("❌ User data is missing!");
        return;
      }

      setUser(userRes.data);

      const scans = foodRes.data || [];
      setTotalScans(scans.length);

      // Filter scans for today (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0];
      const todayScans = scans.filter(
        (scan) => new Date(scan.createdAt).toISOString().split("T")[0] === today
      );
      setScannedFoods(todayScans);

      // Compute consumed macros and health score for today's scans
      let totalCarbs = 0,
        totalFats = 0,
        totalProteins = 0,
        totalSugar = 0,
        totalHealthScore = 0,
        foodsEaten = 0;

      todayScans.forEach((food) => {
        if (food.consumption?.status === "consumed") {
          totalCarbs += food.consumption?.consumedMacros?.Carbohydrates || 0;
          totalFats += food.consumption?.consumedMacros?.Fats || 0;
          totalProteins += food.consumption?.consumedMacros?.Proteins || 0;
          totalSugar += food.consumption?.sugarConsumed || 0;
          totalHealthScore += food.analysis?.healthScore || 0;
          foodsEaten++;
        }
      });

      if (foodsEaten > 0) {
        setHealthScore((totalHealthScore / foodsEaten).toFixed(2));
      }

      setConsumedMacros({
        Carbohydrates: parseFloat(totalCarbs.toFixed(2)),
        Fats: parseFloat(totalFats.toFixed(2)),
        Proteins: parseFloat(totalProteins.toFixed(2)),
        Sugar: parseFloat(totalSugar.toFixed(2)),
      });

      // Compute total calories for today:
      // calories = (Carbs * 4) + (Proteins * 4) + (Fats * 9)
      let caloriesToday = 0;
      todayScans.forEach((food) => {
        if (food.consumption?.status === "consumed") {
          const macros = food.consumption.consumedMacros || {};
          const c = macros.Carbohydrates || 0;
          const p = macros.Proteins || 0;
          const f = macros.Fats || 0;
          caloriesToday += c * 4 + p * 4 + f * 9;
        }
      });
      setTotalCalories(Math.round(caloriesToday));

      // Prepare chart data for the last 7 days
      let caloriesByDate = {};
      scans.forEach((scan) => {
        if (scan.consumption?.status === "consumed") {
          const dateStr = new Date(scan.createdAt).toISOString().split("T")[0];
          const macros = scan.consumption.consumedMacros || {};
          const c = macros.Carbohydrates || 0;
          const p = macros.Proteins || 0;
          const f = macros.Fats || 0;
          const calories = c * 4 + p * 4 + f * 9;
          caloriesByDate[dateStr] = (caloriesByDate[dateStr] || 0) + calories;
        }
      });
      let tempChartData = [];
      for (let i = 6; i >= 0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = d.toISOString().split("T")[0];
        tempChartData.push({
          name: dayName,
          total: Math.round(caloriesByDate[dateStr] || 0),
        });
      }
      setChartData(tempChartData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    }
  };

  if (!user) return <p className="text-white mt-24">Loading...</p>;

  // Recommended daily macros from user health details
  const dailyMacros = user.healthDetails?.dailyMacros || {
    Carbohydrates: 250,
    Fats: 80,
    Proteins: 100,
    Sugar: 50,
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-white">DASHBOARD</h1>

      {/* Top Stats Row: Left column for Total Calories & Health Score; Right column for Macronutrient Consumption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Stacked Total Calories and Health Score Cards */}
        <div className="flex flex-col gap-4">
          <Card className="bg-green-500/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Apple className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-green-500">Total Calories Today</p>
                  <h3 className="text-2xl font-bold text-green-500">
                    {totalCalories} kcal
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <HeartPulse className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-blue-500">Health Score Avg</p>
                  <h3 className="text-2xl font-bold text-blue-500">
                    {healthScore}%
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Macronutrient Consumption Card */}
        <Card className="bg-[#181818] border-0">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Macronutrient Consumption
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Carbohydrates", "Fats", "Proteins", "Sugar"].map((macro) => (
                <div key={macro} className="flex flex-col items-center">
                  <div style={{ width: 80, height: 80 }}>
                    <CircularProgressbar
                      value={(consumedMacros[macro] / (dailyMacros[macro] || 1)) * 100}
                      text={`${Math.round(
                        (consumedMacros[macro] / (dailyMacros[macro] || 1)) * 100
                      )}%`}
                    />
                  </div>
                  <p className="text-white mt-2 text-sm">
                    {macro.toUpperCase()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {Math.round(consumedMacros[macro])}g / {dailyMacros[macro]}g
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Caloric Intake Chart */}
      <Card className="border-0 bg-[#181818]">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white">Caloric Intake</h3>
          <div className="h-[300px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#525252"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Today's Food Scans */}
      <Card className="bg-gray-800 border-0">
        <CardContent className="p-6">
          <h3 className="text-2xl font-semibold text-white">Today's Food Scans</h3>
          {scannedFoods.length === 0 ? (
            <p className="text-gray-400 mt-4">No food scanned today.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {scannedFoods.map((food) => (
                <li key={food._id} className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-white text-sm">
                      {food.analysis?.foodName || "Scanned Food"}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        food.consumption?.status === "consumed"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {food.consumption?.status === "consumed"
                        ? "Eaten ✅"
                        : "Not Eaten ❌"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Scanned at:{" "}
                    {new Date(food.createdAt).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
