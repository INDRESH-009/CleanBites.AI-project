"use client";

import { useState, useEffect } from "react";
import axios from "axios";

// Modal component for detailed view
const Modal = ({ scan, onClose }) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] overflow-y-auto relative p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-700 font-bold text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Detailed Food Scan Analysis</h2>
        <div className="flex flex-col md:flex-row">
          {/* Fixed-size image in modal */}
          <div className="flex-shrink-0">
            <img
              src={scan.imageUrl}
              alt="Food Scan"
              className="w-32 h-32 object-contain rounded"
            />
          </div>
          <div className="flex-1 md:ml-4">
            <p>
              <strong>Calories:</strong>{" "}
              {scan.analysis?.calories || "N/A"}
            </p>
            <p>
              <strong>Processing Level:</strong>{" "}
              {scan.analysis?.processingLevel || "N/A"}
            </p>
            <p>
              <strong>Health Score:</strong>{" "}
              {scan.analysis?.healthScore !== null
                ? scan.analysis.healthScore
                : "N/A"}
            </p>
            <p>
              <strong>Carbon Footprint:</strong>{" "}
              {scan.analysis?.carbonFootprint || "N/A"}
            </p>
            <div className="mt-4">
              <h3 className="font-semibold">Macronutrients</h3>
              {scan.analysis?.macros &&
                Object.entries(scan.analysis.macros).map(
                  ([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {value.quantity}g, Score:{" "}
                      {value.score} / 10
                    </p>
                  )
                )}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Sugar Content</h3>
              <p>
                <strong>Total Sugar:</strong>{" "}
                {scan.analysis?.sugarContent?.totalSugar || "N/A"}
              </p>
              {scan.analysis?.sugarContent?.sugarSources && (
                <ul className="list-disc ml-4">
                  {scan.analysis.sugarContent.sugarSources.map(
                    (src, idx) => (
                      <li key={idx}>{src}</li>
                    )
                  )}
                </ul>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Harmful Ingredients</h3>
              {scan.analysis?.harmfulIngredients &&
              scan.analysis.harmfulIngredients.length > 0 ? (
                <ul className="list-disc ml-4">
                  {scan.analysis.harmfulIngredients.map(
                    (ing, idx) => (
                      <li key={idx}>
                        <strong>{ing.name}:</strong> {ing.effect}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>N/A</p>
              )}
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">Personalized Analysis</h3>
              {scan.analysis?.personalizedAnalysis ? (
                <div>
                  <p>
                    <strong>Medical Condition Impact:</strong>{" "}
                    {scan.analysis.personalizedAnalysis.medicalConditionImpact?.warning ||
                      "N/A"}{" "}
                    (Risk:{" "}
                    {scan.analysis.personalizedAnalysis.medicalConditionImpact?.riskMeter ||
                      "N/A"})
                  </p>
                  <p>
                    <strong>Health Goal Impact:</strong>{" "}
                    {scan.analysis.personalizedAnalysis.healthGoalImpact?.impactSummary ||
                      "N/A"}{" "}
                    (Score:{" "}
                    {scan.analysis.personalizedAnalysis.healthGoalImpact?.goalAlignmentScore ||
                      "N/A"})
                  </p>
                  <p>
                    <strong>Allergen Warnings:</strong>{" "}
                    {scan.analysis.personalizedAnalysis.allergenWarnings?.containsAllergens ||
                      "N/A"}
                  </p>
                  {scan.analysis.personalizedAnalysis.allergenWarnings?.specificAllergens && (
                    <p>
                      <strong>Specific Allergens:</strong>{" "}
                      {scan.analysis.personalizedAnalysis.allergenWarnings.specificAllergens.join(
                        ", "
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <p>N/A</p>
              )}
            </div>
            <div className="mt-4">
              <p>
                <strong>Scan Date & Time:</strong>{" "}
                {new Date(scan.createdAt).toLocaleDateString()}{" "}
                {new Date(scan.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FoodScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

  // Fetch the food scan history from the backend
  const fetchScanHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to view your scan history.");
        return;
      }
      const response = await axios.get(
        "http://localhost:5001/api/foodscan/history",
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

  if (loading) {
    return (
      <p className="text-gray-500 text-center">Loading food scan history...</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Food Scan History</h1>
      {scans.length === 0 ? (
        <p className="text-center text-gray-700">
          No scans found. Start scanning your food items!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {scans.map((scan) => (
            <div
              key={scan._id}
              className="bg-white shadow rounded p-4 flex flex-col md:flex-row cursor-pointer hover:bg-gray-50 transition"
              onClick={() => {
                setSelectedScan(scan);
                setModalOpen(true);
              }}
            >
              <div className="w-48 h-48 flex-shrink-0">
                <img
                  src={scan.imageUrl}
                  alt="Food Scan"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="flex-1 ml-4 flex flex-col justify-center">
                <p className="text-gray-800">
                  <strong>Calories:</strong>{" "}
                  {scan.analysis?.calories || "N/A"}
                </p>
                {scan.analysis?.macros && (
                  <p className="text-gray-800">
                    <strong>Macros:</strong>{" "}
                    {`Carbs: ${scan.analysis.macros.Carbohydrates?.quantity || "N/A"}, Fats: ${scan.analysis.macros.Fats?.quantity || "N/A"}, Proteins: ${scan.analysis.macros.Proteins?.quantity || "N/A"}`}
                  </p>
                )}
                <p className="text-gray-800">
                  <strong>Date & Time:</strong>{" "}
                  {new Date(scan.createdAt).toLocaleDateString()}{" "}
                  {new Date(scan.createdAt).toLocaleTimeString()}
                </p>
                <p className="mt-2 text-blue-600 underline">
                  Click to see more details
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && selectedScan && (
        <Modal
          scan={selectedScan}
          onClose={() => {
            setModalOpen(false);
            setSelectedScan(null);
          }}
        />
      )}
    </div>
  );
};

export default FoodScanHistory;
