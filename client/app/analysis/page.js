"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Import your shadcn/ui components
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

// Import the separated components
import UploadFoodImage from "./UploadFoodImage";
import FoodAnalysis from "./FoodAnalysis";
import ChatFeatures from "./ChatFeatures";

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

  // Consumption feature states
  const [foodScanId, setFoodScanId] = useState(null);
  const [consumed, setConsumed] = useState(null);
  const [percentage, setPercentage] = useState(20);
  const [updatingConsumption, setUpdatingConsumption] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [consumptionComplete, setConsumptionComplete] = useState(false); // vanish bar after submit

  const fileInputRef = useRef(null);
  const analysisRef = useRef(null);

  // Helper styling functions (unchanged)
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

  // Ensure we run in client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check user token
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

  // Scroll to FoodAnalysis when analysis is complete (existing code)
  useEffect(() => {
    if (analysisResult && analysisRef.current) {
      const navbarHeight = 140;
      const rect = analysisRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const targetY = rect.top + scrollTop - navbarHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, [analysisResult]);

  // Handle image upload + analysis
  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!image) {
      alert("Please upload an image");
      return;
    }
    setLoading(true);
    setLoaderText("Extracting");

    const timeoutId = setTimeout(() => {
      setLoaderText("Analyzing");
    }, 3000);

    try {
      // 1) OCR
      const visionFormData = new FormData();
      visionFormData.append("file", image);

      const visionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vision`,
        visionFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!user) throw new Error("User data not loaded correctly");

      // 2) Analyze text
      const analysisResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analyze-food`,
        { userId: user._id, extractedText: visionResponse.data.fullText }
      );

      const analysisData = analysisResponse.data.analysis;
      setAnalysisResult(analysisData);

      // =========================
      // Wrap scrollIntoView in a tiny timeout
      // =========================
      setTimeout(() => {
        if (analysisRef.current) {
          analysisRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);

      // 3) Store the food scan
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

  // Submit consumption
  const handleConsumptionSubmit = async () => {
    if (consumed === null) {
      console.error("Please select Yes or No before submitting consumption.");
      return;
    }

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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/store-analysis`,
        payload
      );
      setUpdateMessage("Consumption updated successfully!");
      setConsumptionComplete(true); // vanish
    } catch (error) {
      console.error("Consumption update error:", error);
      setUpdateMessage("Failed to update consumption.");
    }
    setUpdatingConsumption(false);
  };

  // Back button
  const handleConsumptionBack = () => {
    setConsumed(null);
    setPercentage(20);
    setUpdateMessage("");
  };

  // Determine if consumption bar is currently displayed
  // => True if we have analysis + foodScanId + not done yet, and user didn't pick "No"
  const isConsumptionBarVisible =
    analysisResult && foodScanId && !consumptionComplete && consumed !== false;

  return (
    <div className="w-full relative">
      {/* Upload area */}
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

      {/* Hidden file input for camera capture */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCameraChange}
        style={{ display: "none" }}
      />

      {/* Analysis result */}
      {analysisResult && (
        <div ref={analysisRef} className="scroll-mt-32">
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

      {/* Consumption bar pinned at bottom if not completed and user hasn't said "No" */}
      {isConsumptionBarVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 border-t bg-white px-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full py-2 text-gray-800">
            {/* "Consumption Tracking" heading, centered on mobile */}
            <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
              Consumption Tracking
            </h2>

            {/* Step logic: Are you going to have this? / How much? */}
            {consumed === null && (
              <div className="flex flex-col sm:flex-row sm:items-center md:h-16 sm:gap-4 mt-2 sm:mt-0">
                <p className="text-sm text-gray-500 text-center sm:text-left mb-2 sm:mb-0">
                  Are you going to have this?
                </p>
                <div className="flex flex-row justify-center gap-2">
                  <Button
                    className="bg-blue-600 text-white hover:text-white hover:bg-blue-700"
                    variant="outline"
                    size="sm"
                    onClick={() => setConsumed(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 hover:text-white text-white"
                    variant="outline"
                    size="sm"
                    onClick={() => setConsumed(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {consumed === true && (
              <div className="flex flex-col sm:flex-row sm:items-center md:h-16 sm:gap-4 mt-2 sm:mt-0">
                <p className="text-sm text-center sm:text-left mb-2 sm:mb-0">
                  How much of it will you have?
                </p>
                <div className="flex flex-row items-center gap-2 justify-center sm:justify-start mb-2 sm:mb-0">
                  <Slider
                    defaultValue={[percentage]}
                    max={100}
                    step={1}
                    className="w-36 sm:w-60"
                    onValueChange={(value) => {
                      setPercentage(value[0]);
                    }}
                  />
                  <span className="min-w-[3rem] text-sm font-medium">
                    {percentage}%
                  </span>
                </div>
                <div className="flex flex-row items-center gap-2 justify-center sm:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConsumptionBack}
                    disabled={updatingConsumption}
                  >
                    Back
                  </Button>
                  <Button size="sm" onClick={handleConsumptionSubmit}>
                    {updatingConsumption ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* After submission or if user chooses "No", bar vanishes */}
      {updateMessage && (
        <p className="text-center mt-4 text-sm text-gray-700">{updateMessage}</p>
      )}

      {/* ChatFeature always visible now */}
      {analysisResult && (
        <ChatFeatures
          showChat={showChat}
          setShowChat={setShowChat}
        />
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
      `}</style>
    </div>
  );
}
