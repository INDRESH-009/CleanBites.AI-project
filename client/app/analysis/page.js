"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import ChatModal from "../components/ChatModal.js";
import { Button } from "@/components/ui/button";

// UI components for the new design
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell } from "recharts";

// Lucide icons
import {
  Upload,
  Check,
  AlertTriangle,
  X,
  Car,
  Droplet,
  Apple,
  ChevronRight,
  Camera,
} from "lucide-react";

// Helper to set badge colors for Medical Condition Impact
const getBadgeClasses = (variant) => {
  if (variant === "destructive") return "bg-red-500 text-white";
  if (variant === "warning") return "bg-yellow-500 text-white";
  if (variant === "secondary") return "bg-green-500 text-white";
  return "bg-gray-500 text-white";
};

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

  // Refs for the hidden camera input and the analysis section
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

  // Setup dropzone for file upload
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

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

  // When analysis is ready, scroll smoothly to the analysis section.
  useEffect(() => {
    if (analysisResult && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [analysisResult]);

  // Analysis handler (calls your APIs)
  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!image) {
      alert("Please upload an image");
      return;
    }
    setLoading(true);
    setLoaderText("Extracting");
    // Schedule the loader text to change after 3 seconds.
    const timeoutId = setTimeout(() => {
      setLoaderText("Analyzing");
    }, 3000);
    try {
      // Step 1: Upload image to Vision API for OCR
      const visionFormData = new FormData();
      visionFormData.append("file", image);
      const visionResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vision`,
        visionFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!user) {
        throw new Error("User data not loaded correctly");
      }

      // Step 2: Send the OCR result to the AI analysis endpoint
      const analysisResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analyze-food`,
        { userId: user._id, extractedText: visionResponse.data.fullText }
      );

      const analysisData = analysisResponse.data.analysis;
      setAnalysisResult(analysisData);

      // Step 3: Store the food scan in the database
      const storeFormData = new FormData();
      storeFormData.append("foodImage", image);
      storeFormData.append("userId", user._id);
      storeFormData.append("analysisData", JSON.stringify(analysisData));
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/foodscan/store-analysis`,
        storeFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process the image. Please try again.");
    } finally {
      // Clear the timeout to avoid delayed changes to loaderText.
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Function to trigger the hidden camera input
  const handleScanClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler for the hidden camera input change
  const handleCameraChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="w-full relative">
      {/* Upload Food Image Section */}
      <section className="min-h-screen flex items-center justify-center bg-[#181818] p-6 w-full">
        {loading ? (
          // Loader shown instead of the card component
          <div className="flex flex-col items-center justify-center">
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
          // Upload UI is rendered only when not loading
          <div className="w-full max-w-2xl">
            <div className="rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold text-white">Upload Food Image</h2>
                <p className="text-gray-400">
                  Take a photo or upload an image of your food label
                </p>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-12 mt-6"
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    {!image ? (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 text-gray-400" />
                        <p className="text-sm text-gray-300 text-center">
                          Drag & drop your food image, or click to select
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          Supports PNG, JPG or JPEG
                        </p>
                      </div>
                    ) : (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt="Food Label Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={(e) => handleScanClick(e)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Use Camera
                      </Button>
                      <Button
                        onClick={(e) => handleSubmit(e)}
                        disabled={!image || loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {loading ? "Processing..." : "Analyze Food"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Hidden file input for camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleCameraChange}
        style={{ display: "none" }}
      />

      {/* Analysis Result Section */}
      {analysisResult && (
        // "scroll-mt-20" sets a scroll-margin-top of 80px
        <section ref={analysisRef} className="py-6 scroll-mt-20">
          <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden mt-6">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-2xl font-bold">AI Food Analysis</CardTitle>
              <CardDescription className="text-purple-100">
                Comprehensive nutritional insights
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Analysis result details (existing code) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Total Calories</p>
                        <p className="text-2xl text-gray-900 font-bold">
                          {analysisResult.calories || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Processing Level</p>
                        <Badge
                          variant={getProcessingLevelVariant(
                            analysisResult.processingLevel
                          )}
                          className="mt-1"
                        >
                          {analysisResult.processingLevel || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Health Score</h3>
                    <Progress
                      value={analysisResult.healthScore || 0}
                      className="h-3 bg-gray-200"
                      indicatorClassName={getProgressIndicatorClass(
                        analysisResult.healthScore || 0
                      )}
                    />
                    <p className="text-right text-sm text-gray-900 mt-1">
                      {analysisResult.healthScore || 0} / 100
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Carbon Footprint</h3>
                    <div className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-gray-700" />
                      <p className="text-sm text-gray-900">
                        {analysisResult.carbonFootprint || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Macronutrients</h3>
                    {analysisResult.macros ? (
                      (() => {
                        const carbs =
                          parseFloat(
                            analysisResult.macros["Carbohydrates"]?.quantity
                          ) || 0;
                        const fats =
                          parseFloat(analysisResult.macros["Fats"]?.quantity) || 0;
                        const proteins =
                          parseFloat(analysisResult.macros["Proteins"]?.quantity) ||
                          0;
                        const totalRaw = carbs + fats + proteins;
                        const total = totalRaw.toFixed(1);
                        const macroData = [
                          { name: "Carbs", value: carbs, color: "#FF6384" },
                          { name: "Fats", value: fats, color: "#36A2EB" },
                          { name: "Proteins", value: proteins, color: "#FFCE56" },
                        ];
                        return (
                          <>
                            <div
                              className="relative mx-auto"
                              style={{ width: "200px", height: "200px" }}
                            >
                              <PieChart
                                width={200}
                                height={200}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                              >
                                <Pie
                                  data={macroData}
                                  cx={100}
                                  cy={100}
                                  innerRadius={60}
                                  outerRadius={80}
                                  dataKey="value"
                                  startAngle={-90}
                                  endAngle={270}
                                >
                                  {macroData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                      stroke="none"
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                              <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{
                                  transform: "translate(-50%, -50%)",
                                  top: "50%",
                                  left: "50%",
                                }}
                              >
                                <div className="text-center">
                                  <p className="text-xl font-bold text-gray-900">
                                    {total}g
                                  </p>
                                  <p className="text-sm text-gray-900">Total</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {macroData.map((macro) => (
                                <div key={macro.name} className="text-center">
                                  <div
                                    className="w-4 h-4 rounded-full mx-auto mb-1"
                                    style={{ backgroundColor: macro.color }}
                                  ></div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {macro.name}
                                  </p>
                                  <p className="text-xs text-gray-900">
                                    {macro.value}g
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-sm text-gray-900">No data available</p>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sugar Content</h3>
                    <div className="flex items-center space-x-2">
                      <Droplet className="w-5 h-5 text-blue-500" />
                      <p className="text-xl font-bold text-gray-900">
                        {analysisResult.sugarContent?.totalSugar || "N/A"}g
                      </p>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">
                      {analysisResult.sugarContent?.sugarSources
                        ? `Source: ${analysisResult.sugarContent.sugarSources.join(", ")}`
                        : "Source: N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Micronutrients</h3>
                    {analysisResult.micros && analysisResult.micros.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.micros.map((micro, idx) => (
                          <Badge key={idx} variant="secondary">{micro}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-900">No micronutrients data</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Harmful Ingredients</h3>
                    {analysisResult.harmfulIngredients && analysisResult.harmfulIngredients.length > 0 ? (
                      <ul className="space-y-2">
                        {analysisResult.harmfulIngredients.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{item.name}:</span> {item.effect}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-900">No harmful ingredients detected.</p>
                    )}
                  </div>
                  {analysisResult.personalizedAnalysis?.medicalConditionImpact && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Personalized Analysis</h3>
                      <Card className="bg-orange-100 border-orange-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-orange-800">Medical Condition Impact</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge className={`mb-2 ${getBadgeClasses(getRiskMeterVariant(analysisResult.personalizedAnalysis.medicalConditionImpact.riskMeter))}`}>
                            {analysisResult.personalizedAnalysis.medicalConditionImpact.riskMeter || "N/A"}
                          </Badge>
                          <p className="text-sm text-orange-800">
                            {analysisResult.personalizedAnalysis.medicalConditionImpact.warning || "No warnings provided."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {analysisResult.personalizedAnalysis?.healthGoalImpact && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Health Goal Impact</h3>
                      <p className="text-sm text-gray-900 mb-2">
                        {analysisResult.personalizedAnalysis.healthGoalImpact.impactSummary || "No impact summary provided."}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-900 font-medium">Goal Alignment:</p>
                        <Progress
                          value={analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0}
                          className="h-2 flex-grow bg-gray-200"
                          indicatorClassName={getProgressIndicatorClass(analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0)}
                        />
                        <p className="text-sm text-gray-900">
                          {analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore || 0} / 100
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {analysisResult.personalizedAnalysis?.goodAndBadEffects && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Good & Bad Effects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-100 border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-green-800">Pros</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analysisResult.personalizedAnalysis.goodAndBadEffects.pros &&
                        analysisResult.personalizedAnalysis.goodAndBadEffects.pros.length > 0 ? (
                          <ul className="space-y-2">
                            {analysisResult.personalizedAnalysis.goodAndBadEffects.pros.map((pro, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <Check className="w-5 h-5 text-green-500" />
                                <p className="text-sm text-green-800">{pro}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-900">No pros listed.</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-red-100 border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-red-800">Cons</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analysisResult.personalizedAnalysis.goodAndBadEffects.cons &&
                        analysisResult.personalizedAnalysis.goodAndBadEffects.cons.length > 0 ? (
                          <ul className="space-y-2">
                            {analysisResult.personalizedAnalysis.goodAndBadEffects.cons.map((con, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <X className="w-5 h-5 text-red-500" />
                                <p className="text-sm text-red-800">{con}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-900">No cons listed.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              {analysisResult.personalizedAnalysis?.healthierAlternatives &&
                analysisResult.personalizedAnalysis.healthierAlternatives.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Healthier Alternatives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResult.personalizedAnalysis.healthierAlternatives.map((alt, idx) => (
                      <Card key={idx} className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-blue-800 flex items-center space-x-2">
                            <Apple className="w-5 h-5" />
                            <span>{alt.name}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2 mb-2">
                            <Progress value={alt.healthScore || 0} className="h-2 flex-grow bg-blue-200" indicatorClassName="bg-blue-500" />
                            <p className="text-sm font-medium text-blue-800">
                              {alt.healthScore || 0} / 100
                            </p>
                          </div>
                          <p className="text-sm text-blue-800">{alt.reason || "No reason provided."}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {analysisResult.personalizedAnalysis?.futureImpact && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Future Impact</h3>
                  <Card className="bg-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-purple-800 mb-2">
                        {analysisResult.personalizedAnalysis.futureImpact.longTermEffect || "No long-term effect provided."}
                      </p>
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="w-5 h-5 text-purple-500" />
                        <p className="text-sm font-medium text-purple-800">
                          Weight Gain Risk:{" "}
                          {analysisResult.personalizedAnalysis.futureImpact.weightGainRisk || "N/A"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
      {analysisResult && (
        <div className="mt-6 text-center">
          <button onClick={() => setShowChat(true)} className="bg-blue-600 text-white py-2 px-4 rounded">
            Ask any query to your personal assistant
          </button>
        </div>
      )}
      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
      <style jsx>{`
        /* Loader SVG CSS from Uiverse.io by milley69 */
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

        /* Loader Text Dots Animation */
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
