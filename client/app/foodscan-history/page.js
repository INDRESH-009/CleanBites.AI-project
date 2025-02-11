"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Flame,
  Pizza,
  X,
  Leaf,
  Heart,
  Car,
  BeefIcon,
  Cookie,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------
// Helper function to compute width percentage from a value and max.
// Using parseFloat with a fallback to 0 to ensure we get a numeric value.
// ---------------------------------------------------------------------
const computeWidth = (value, max) => {
  const numericValue = parseFloat(value) || 0;
  if (!max) return 0;
  return Math.min((numericValue / max) * 100, 100);
};

// ------------------------------
// FoodScanOverlay Component (New Modal Design)
// ------------------------------
function FoodScanOverlay({ isOpen, onClose, data }) {
  // Convert sugar total to a number using parseFloat (fallback to 0)
  const sugarTotal = parseFloat(data.sugar.total) || 0;
  
  // ✅ Add this to ensure `consumedMacros` always has default values
  const consumedMacros = data.consumption?.consumedMacros || {
    Carbohydrates: 0,
    Fats: 0,
    Proteins: 0,
    sugarConsumed: 0,
  };

  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl bg-black backdrop-blur-xl border-gray-800 p-0">
            {/* Accessibility: Provide a hidden title */}
            <DialogTitle>
              <span className="sr-only">Detailed Food Scan Analysis</span>
            </DialogTitle>
            {/* Wrapping the content in a scrollable container */}
            <div className="max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {/* Header */}
                <div className="relative p-6 pb-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Detailed Food Scan Analysis
                  </h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                      icon={<Flame className="h-5 w-5 text-orange-500" />}
                      label="Calories"
                      value={`${data.calories} kcal`}
                    />
                    <MetricCard
                      icon={<Leaf className="h-5 w-5 text-green-500" />}
                      label="Processing"
                      value={data.processingLevel}
                    />
                    <MetricCard
                      icon={<Heart className="h-5 w-5 text-red-500" />}
                      label="Health Score"
                      value={`${data.healthScore}/100`}
                    />
                    {/* Carbon Footprint card spanning full width */}
                    <div className="md:col-span-3">
                      <MetricCard
                        icon={<Car className="h-5 w-5 text-blue-500" />}
                        label="Carbon Footprint"
                        value={data.carbonFootprint}
                      />
                    </div>
                  </div>

                  {/* Macronutrients */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <BeefIcon className="h-5 w-5 text-purple-500" />
                      Macronutrients
                    </h3>
                    <div className="grid gap-4">
                      <MacroRow
                        label="Carbohydrates"
                        value={data.macros.carbs.value}
                        score={data.macros.carbs.score}
                        color="bg-blue-500"
                        maxGrams={100}
                      />
                      <MacroRow
                        label="Fats"
                        value={data.macros.fats.value}
                        score={data.macros.fats.score}
                        color="bg-yellow-500"
                        maxGrams={100}
                      />
                      <MacroRow
                        label="Proteins"
                        value={data.macros.proteins.value}
                        score={data.macros.proteins.score}
                        color="bg-red-500"
                        maxGrams={100}
                      />
                    </div>
                  </div>

                  {/* Sugar Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Cookie className="h-5 w-5 text-pink-500" />
                      Sugar Content
                    </h3>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Total Sugar</span>
                        <span className="text-white font-medium">
                          {data.sugar.total}g
                        </span>
                      </div>
                      {/* Custom sugar progress bar */}
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500"
                          style={{
                            width: `${computeWidth(sugarTotal, 50)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {data.harmful.ingredients.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Warnings
                      </h3>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-yellow-200 text-sm">
                          {data.harmful.ingredients[0].description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Personalized Analysis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Personalized Analysis
                    </h3>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-gray-400">Medical Impact</h4>
                        <p className="text-white text-sm">
                          {data.personalized.medical}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-400 border-red-500/20"
                      >
                        Risk: {data.personalized.risk}
                      </Badge>
                    </div>
                  </div>

                                   {/* ✅ Consumed Macros Section */}
                                   <div className="consumed-macros">
                    <h3 className="text-lg font-semibold text-white">
                      Consumed Macros
                    </h3>
                    {data.consumption && data.consumption.consumedMacros ? (
                      <>
                        <p>Carbohydrates: {consumedMacros.Carbohydrates}g</p>
                        <p>Fats: {consumedMacros.Fats}g</p>
                        <p>Proteins: {consumedMacros.Proteins}g</p>
                        <p>Sugar Consumed: {data.consumption.sugarConsumed}g</p>
                      </>
                    ) : (
                      <p className="text-gray-400">No macro consumption data available.</p>
                    )}
                  </div>




                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Scanned: {new Date(data.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------
// MetricCard Component remains the same
// ---------------------------------------------------------------------
function MetricCard({ icon, label, value }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------
// MacroRow Component – using gram-based progress
// ---------------------------------------------------------------------
function MacroRow({ label, value, score, color, maxGrams = 100 }) {
  const widthPercentage = computeWidth(value, maxGrams);
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400">{label}</span>
        <div className="flex items-center gap-4">
          <span className="text-white">{value}g</span>
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-400 border-red-500/20"
          >
            {score}/10
          </Badge>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// MacroBar Component used in FoodScanHistory (unchanged)
// ---------------------------------------------------------------------
const MacroBar = ({ label, value, max, color }) => {
  const widthPercentage = computeWidth(value, max);
  const numericValue = parseFloat(value) || 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">
          {isNaN(numericValue) ? "N/A" : `${numericValue}g`}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${widthPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// ------------------------------
// FoodScanHistory Component (Uses FoodScanOverlay)
// ------------------------------
const FoodScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  // Fetch the scan history from the backend
  const fetchScanHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to view your scan history.");
        return;
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScans(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching scan history:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanHistory();
  }, []);

  // Map the selected scan to the data structure expected by FoodScanOverlay
  const mapScanToOverlayData = (scan) => ({
    calories: scan.analysis?.calories || 0,
    processingLevel: scan.analysis?.processingLevel || "N/A",
    healthScore: scan.analysis?.healthScore || 0,
    carbonFootprint: scan.analysis?.carbonFootprint || "N/A",
    macros: {
      carbs: {
        value: scan.analysis?.macros?.Carbohydrates?.quantity || 0,
        score: scan.analysis?.macros?.Carbohydrates?.score || 0,
      },
      fats: {
        value: scan.analysis?.macros?.Fats?.quantity || 0,
        score: scan.analysis?.macros?.Fats?.score || 0,
      },
      proteins: {
        value: scan.analysis?.macros?.Proteins?.quantity || 0,
        score: scan.analysis?.macros?.Proteins?.score || 0,
      },
    },
    sugar: {
      total: scan.analysis?.sugarContent?.totalSugar || 0,
      types: scan.analysis?.sugarContent?.sugarSources || [],
    },
    harmful: {
      ingredients:
        scan.analysis?.harmfulIngredients?.map((ing) => ({
          name: ing.name,
          description: ing.effect,
        })) || [],
    },
    personalized: {
      medical:
        scan.analysis?.personalizedAnalysis?.medicalConditionImpact?.warning ||
        "N/A",
      healthGoal:
        scan.analysis?.personalizedAnalysis?.healthGoalImpact?.impactSummary ||
        "N/A",
      risk:
        scan.analysis?.personalizedAnalysis?.medicalConditionImpact
          ?.riskMeter || "N/A",
    },
    allergens: scan.analysis?.allergens || [],
    timestamp: scan.createdAt,

    // ✅ Added Consumed Macros Mapping
    consumption: {
      consumedMacros: {
        Carbohydrates: scan.consumption?.consumedMacros?.Carbohydrates || 0,
        Fats: scan.consumption?.consumedMacros?.Fats || 0,
        Proteins: scan.consumption?.consumedMacros?.Proteins || 0,
        sugarConsumed: scan.consumption?.sugarConsumed || 0,
      },
    },
});

  

  if (loading) {
    return (
      <p className="text-gray-500 text-center">
        Loading food scan history...
      </p>
    );
  }


  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-black">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-white mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Food Tracker
        </motion.h1>
        {scans.length === 0 ? (
          <p className="text-center text-gray-400">
            No scans found. Start scanning your food items!
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {scans.map((scan) => (
              <motion.div
                key={scan._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  className="overflow-hidden bg-black border border-gray-800 shadow-lg backdrop-blur-sm hover:brightness-110 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedScan(scan);
                    setModalOpen(true);
                  }}
                >
                  <CardHeader className="p-0">
                    <div className="relative h-48 bg-black">
                      {scan.imageUrl ? (
                        <img
                          src={scan.imageUrl}
                          alt="Food Scan"
                          className="w-full h-full object-contain rounded"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Pizza className="h-20 w-20 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-2xl font-bold text-white">
                          {scan.analysis?.calories || "N/A"}
                          <span className="text-sm text-gray-400 ml-1">
                            kcal
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <MacroBar
                        label="Carbs"
                        value={scan.analysis?.macros?.Carbohydrates?.quantity}
                        max={100}
                        color="bg-blue-500"
                      />
                      <MacroBar
                        label="Fats"
                        value={scan.analysis?.macros?.Fats?.quantity}
                        max={100}
                        color="bg-yellow-500"
                      />
                      <MacroBar
                        label="Proteins"
                        value={scan.analysis?.macros?.Proteins?.quantity}
                        max={100}
                        color="bg-red-500"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-4 bg-black/80 flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {new Date(scan.createdAt).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScan(scan);
                        setModalOpen(true);
                      }}
                    >
                      Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      {modalOpen && selectedScan && (
        <FoodScanOverlay

        
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedScan(null);
          }}
          data={mapScanToOverlayData(selectedScan)}
        />
      )}
    </div>
  );
};

export default FoodScanHistory;
