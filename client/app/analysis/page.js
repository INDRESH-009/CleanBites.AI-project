"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Import the separated components
import UploadFoodImage from "./UploadFoodImage";
import FoodAnalysis from "./FoodAnalysis";
import ChatFeatures from "./ChatFeatures";
import ConsumptionSlider from "../components/ConsumptionSlider";

export default function AnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loaderText, setLoaderText] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // NEW: State for consumption feature
  const [foodScanId, setFoodScanId] = useState(null);
  const [consumed, setConsumed] = useState(null); // null: no choice; true/false once chosen
  const [percentage, setPercentage] = useState(0);
  const [updatingConsumption, setUpdatingConsumption] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");


  const fileInputRef = useRef(null);
  const analysisRef = useRef(null);

  // Helper functions for dynamic styling
  const getProgressIndicatorClass = (score) => {
    if (score < 33) return "bg-red-500";
    else if (score < 66) return "bg-yellow-500";
    else return "bg-green-500";
  };

  const getProcessingLevelVariant = (level) => {
    if (!level) return "default";
    const levelLower = level.toLowerCase();
    if (levelLower.includes("high") || levelLower.includes("ultra"))
      return "destructive";
    if (levelLower.includes("medium")) return "warning";
    if (levelLower.includes("low") || levelLower.includes("minimal"))
      return "secondary";
    return "default";
  };

  const getRiskMeterVariant = (risk) => {
    if (!risk) return "default";
    const riskLower = risk.toLowerCase();
    if (riskLower.includes("high")) return "destructive";
    if (riskLower.includes("medium")) return "warning";
    if (riskLower.includes("low")) return "secondary";
    return "default";
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, [router, isClient]);

  // When analysisResult is set, scroll to the top of the FoodAnalysis component.
  useEffect(() => {
    if (analysisResult && analysisRef.current) {
      // Calculate the top position of the FoodAnalysis component.
      // If you have a fixed navbar overlapping, adjust navbarHeight accordingly.
      const navbarHeight = 80; // Change this value if necessary
      const rect = analysisRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - navbarHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, [analysisResult]);

  // Analysis handler (calls your APIs)
  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!image) {
      alert("Please upload an image");
      return;
    }
    // Hide upload area and show loader immediately
    setLoading(true);
    setLoaderText("Extracting");
    const timeoutId = setTimeout(() => {
      setLoaderText("Analyzing");
    }, 3000);
    try {
      // Step 1: Upload image for OCR
      const visionFormData = new FormData();
      visionFormData.append("file", image);
      const visionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vision`,
        visionFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!user) throw new Error("User data not loaded correctly");

      // Step 2: Analyze the extracted text
      const analysisResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analyze-food`,
        { userId: user._id, extractedText: visionResponse.data.fullText }
      );

      const analysisData = analysisResponse.data.analysis;
      setAnalysisResult(analysisData);

      // Step 3: Store the food scan
      const storeFormData = new FormData();
      storeFormData.append("foodImage", image);
      storeFormData.append("userId", user._id);
      storeFormData.append("analysisData", JSON.stringify(analysisData));
      const storeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/store-analysis`,
        storeFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setFoodScanId(storeResponse.data.foodScan._id);
      
      
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process the image. Please try again.");
    } finally {
      clearTimeout(timeoutId);
      // Restore the upload area (with preview intact)
      setLoading(false);
    }
  };

  const handleScanClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleCameraChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };
  // NEW: Function to submit consumption update
  const handleConsumptionSubmit = async () => {
    // Check if the consumed state is defined
    if (consumed === null) {
      console.error("consumed is not defined. Please select Yes or No before submitting consumption.");
      return;
    }
  
    // Prepare and log the payload
    const payload = {
      consumptionResponse: {
        foodScanId,
        consumed,
        percentage: consumed ? percentage : 0,
      },
    };
    console.log("Sending consumption payload:", payload);
  
    setUpdatingConsumption(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/store-analysis`,
        payload
      );
      setUpdateMessage("Consumption updated successfully!");
    } catch (error) {
      console.error("Consumption update error:", error);
      setUpdateMessage("Failed to update consumption.");
    }
    setUpdatingConsumption(false);
  };
  


  return (
    <div className="w-full relative">
      {/* Centered container for upload area and loader */}
      <div className="w-full mx-auto mt-32 mb-12 max-w-2xl">
        {loading ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ minHeight: "calc(100vh - 150px)" }}
          >
            <div className="loading">
              <svg width="64px" height="48px">
                <polyline
                  points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                  id="back"
                ></polyline>
                <polyline
                  points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                  id="front"
                ></polyline>
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              {loaderText}
              <span className="ml-2">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </p>
          </div>
        ) : (
          <UploadFoodImage
            image={image}
            setImage={setImage}
            preview={preview}
            setPreview={setPreview}
            handleScanClick={handleScanClick}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCameraChange}
        style={{ display: "none" }}
      />
      {analysisResult && (
        <div ref={analysisRef}>
          <FoodAnalysis
            analysisResult={analysisResult}
            getBadgeClasses={(variant) =>
              variant === "destructive"
                ? "bg-red-500 text-white"
                : variant === "warning"
                ? "bg-yellow-500 text-white"
                : variant === "secondary"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }
            getProcessingLevelVariant={getProcessingLevelVariant}
            getProgressIndicatorClass={getProgressIndicatorClass}
            getRiskMeterVariant={getRiskMeterVariant}
          />
        </div>
      )}
      {analysisResult && foodScanId && (
      <div className="mt-8 p-4 border-t border-gray-300">
        <h2 className="text-xl font-bold">Consumption Tracking</h2>
        <p>Are you going to have this?</p>
        <div className="flex gap-4 mt-2">
  <button
    onClick={() => setConsumed(true)}
    className="px-4 py-2 bg-green-500 text-white rounded"
  >
    Yes
  </button>
  <button
    onClick={() => setConsumed(false)}
    className="px-4 py-2 bg-red-500 text-white rounded"
  >
    No
  </button>
</div>

        {consumed === true && (
          <div className="mt-4">
            <ConsumptionSlider
              value={percentage}
              onChange={setPercentage}
              label="How much of it will you have?"
            />
          </div>
        )}
        {consumed !== null && (
          <div className="mt-4">
            <button
              onClick={handleConsumptionSubmit}
              disabled={updatingConsumption}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {updatingConsumption ? "Submitting..." : "Submit Consumption"}
            </button>
            {updateMessage && <p className="mt-2 text-sm text-gray-700">{updateMessage}</p>}
          </div>
        )}
      </div>
      )}    

      {analysisResult && (
        <ChatFeatures showChat={showChat} setShowChat={setShowChat} />
      )}
      <style jsx>{`
        .loading svg polyline {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .loading svg polyline#back {
          stroke: #ff4d5033;
        }
        .loading svg polyline#front {
          stroke: #ff4d4f;
          stroke-dasharray: 48, 144;
          stroke-dashoffset: 192;
          animation: dash_682 1.4s linear infinite;
        }
        @keyframes dash_682 {
          72.5% {
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .dot {
          opacity: 0;
          animation: blink 1s infinite;
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
