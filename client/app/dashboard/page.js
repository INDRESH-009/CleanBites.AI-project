"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isClient, setIsClient] = useState(false);

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

        axios.get("http://localhost:5001/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => setUser(res.data))
        .catch(() => {
            localStorage.removeItem("token");
            router.push("/auth/login");
        });
    }, [router, isClient]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!image) {
            alert("Please upload an image");
            return;
        }

        setLoading(true);

        try {
            // Step 1: Upload image to Vision API for OCR
            const visionFormData = new FormData();
            visionFormData.append("file", image);

            const visionResponse = await axios.post(
                "http://localhost:5001/api/vision",
                visionFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (!user) {
                throw new Error("User data not loaded correctly");
            }

            // Step 2: Send the OCR result to the AI analysis endpoint
            const analysisResponse = await axios.post("http://localhost:5001/api/analyze-food", {
                userId: user._id,
                extractedText: visionResponse.data.fullText
            });

            const analysisData = analysisResponse.data.analysis;
            setAnalysisResult(analysisData);

            // Step 3: Store the food scan in the database
            // Note: extractedText is omitted as per your request.
            const storeFormData = new FormData();
            storeFormData.append("foodImage", image);
            storeFormData.append("userId", user._id);
            storeFormData.append("analysisData", JSON.stringify(analysisData));

            await axios.post(
                "http://localhost:5001/api/foodscan/store-analysis",
                storeFormData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
        } catch (error) {
            console.error("Error processing image:", error);
            alert("Failed to process the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Colors for macronutrient progress bars
    const macroColors = {
        Carbohydrates: "bg-green-500",
        Fats: "bg-yellow-500",
        Proteins: "bg-blue-500",
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-black p-6 pt-28 w-full">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Food Image</h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mb-4 border p-2 rounded w-full"
                />
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-h-60 object-contain border mb-4"
                    />
                )}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Processing..." : "Analyze Food"}
                </button>
            </div>

            {analysisResult && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-5xl text-gray-900">
                    <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
                        AI Food Analysis
                    </h2>

                    {/* General Food Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border rounded bg-gray-50">
                            <strong>Total Calories:</strong> {analysisResult.calories || "N/A"}
                        </div>
                        <div className="p-4 border rounded bg-gray-50">
                            <strong>Processing Level:</strong> {analysisResult.processingLevel || "N/A"}
                        </div>
                        <div className="p-4 border rounded bg-gray-50">
                            <strong>Health Score:</strong> {analysisResult.healthScore ? `${analysisResult.healthScore} / 100` : "N/A"}
                        </div>
                        <div className="p-4 border rounded bg-gray-50">
                            <strong>Carbon Footprint:</strong> {analysisResult.carbonFootprint || "N/A"}
                        </div>
                    </div>

                    {/* Macronutrients */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">Macronutrients</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysisResult.macros && Object.entries(analysisResult.macros).map(([key, value]) => (
                                <div key={key} className="p-4 border rounded bg-gray-50">
                                    <h4 className="font-medium mb-2">{key}</h4>
                                    <Progress value={value.score * 10} className="h-4 w-full rounded" barClassName={macroColors[key]} />
                                    <p className="mt-2 text-center">Quantity: {value.quantity}g</p>
                                    <p className="mt-1 text-center">Score: {value.score} / 10</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sugar Content & Micronutrients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border rounded bg-gray-50">
                            <h3 className="font-semibold mb-2">Sugar Content</h3>
                            <p><strong>Total Sugar:</strong> {analysisResult.sugarContent?.totalSugar || "N/A"} g</p>
                            <p className="mt-2"><strong>Sugar Sources:</strong></p>
                            {analysisResult.sugarContent?.sugarSources && analysisResult.sugarContent.sugarSources.length > 0 ? (
                                <ul className="list-disc ml-5">
                                    {analysisResult.sugarContent.sugarSources.map((src, idx) => (
                                        <li key={idx}>{src}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                        <div className="p-4 border rounded bg-gray-50">
                            <h3 className="font-semibold mb-2">Micronutrients</h3>
                            {analysisResult.micros && analysisResult.micros.length > 0 ? (
                                <ul className="list-disc ml-5">
                                    {analysisResult.micros.map((micro, idx) => (
                                        <li key={idx}>{micro}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>N/A</p>
                            )}
                        </div>
                    </div>

                    {/* Harmful Ingredients */}
                    <div className="p-4 border rounded bg-gray-50 mb-6">
                        <h3 className="font-semibold mb-2">Harmful Ingredients</h3>
                        {analysisResult.harmfulIngredients && analysisResult.harmfulIngredients.length > 0 ? (
                            <ul className="list-disc ml-5">
                                {analysisResult.harmfulIngredients.map((item, idx) => (
                                    <li key={idx}>
                                        <strong>{item.name}</strong>: {item.effect}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No harmful ingredients detected.</p>
                        )}
                    </div>

                    {/* Personalized Analysis */}
                    {analysisResult.personalizedAnalysis && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">Personalized Analysis</h3>
                            {/* Medical Condition Impact */}
                            <div className="p-4 border rounded bg-gray-50 mb-4">
                                <h4 className="font-medium">Medical Condition Impact</h4>
                                <p>
                                    <strong>Risk Level:</strong> {analysisResult.personalizedAnalysis.medicalConditionImpact?.riskMeter || "N/A"}
                                </p>
                                <p>
                                    <strong>Warning:</strong> {analysisResult.personalizedAnalysis.medicalConditionImpact?.warning || "N/A"}
                                </p>
                            </div>
                            {/* Health Goal Impact */}
                            <div className="p-4 border rounded bg-gray-50 mb-4">
                                <h4 className="font-medium">Health Goal Impact</h4>
                                <p>
                                    <strong>Impact Summary:</strong> {analysisResult.personalizedAnalysis.healthGoalImpact?.impactSummary || "N/A"}
                                </p>
                                <p>
                                    <strong>Goal Alignment Score:</strong> {analysisResult.personalizedAnalysis.healthGoalImpact?.goalAlignmentScore ? `${analysisResult.personalizedAnalysis.healthGoalImpact.goalAlignmentScore} / 100` : "N/A"}
                                </p>
                            </div>
                            {/* Allergen Warnings */}
                            <div className="p-4 border rounded bg-gray-50 mb-4">
                                <h4 className="font-medium">Allergen Warnings</h4>
                                <p>
                                    <strong>Contains Allergens:</strong> {analysisResult.personalizedAnalysis.allergenWarnings?.containsAllergens || "N/A"}
                                </p>
                                {analysisResult.personalizedAnalysis.allergenWarnings?.specificAllergens &&
                                    analysisResult.personalizedAnalysis.allergenWarnings.specificAllergens.length > 0 && (
                                        <p>
                                            <strong>Specific Allergens:</strong> {analysisResult.personalizedAnalysis.allergenWarnings.specificAllergens.join(", ")}
                                        </p>
                                    )
                                }
                            </div>
                            {/* Good & Bad Effects */}
                            <div className="p-4 border rounded bg-gray-50 mb-4">
                                <h4 className="font-medium">Good & Bad Effects</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold">Pros:</p>
                                        {analysisResult.personalizedAnalysis.goodAndBadEffects?.pros && analysisResult.personalizedAnalysis.goodAndBadEffects.pros.length > 0 ? (
                                            <ul className="list-disc ml-5">
                                                {analysisResult.personalizedAnalysis.goodAndBadEffects.pros.map((pro, idx) => (
                                                    <li key={idx}>✅ {pro}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>N/A</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">Cons:</p>
                                        {analysisResult.personalizedAnalysis.goodAndBadEffects?.cons && analysisResult.personalizedAnalysis.goodAndBadEffects.cons.length > 0 ? (
                                            <ul className="list-disc ml-5">
                                                {analysisResult.personalizedAnalysis.goodAndBadEffects.cons.map((con, idx) => (
                                                    <li key={idx}>❌ {con}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>N/A</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Healthier Alternatives */}
                            <div className="p-4 border rounded bg-gray-50 mb-4">
                                <h4 className="font-medium">Healthier Alternatives</h4>
                                {analysisResult.personalizedAnalysis.healthierAlternatives && analysisResult.personalizedAnalysis.healthierAlternatives.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {analysisResult.personalizedAnalysis.healthierAlternatives.map((alt, idx) => (
                                            <div key={idx} className="border p-3 rounded bg-white shadow">
                                                <p><strong>Name:</strong> {alt.name}</p>
                                                <p><strong>Health Score:</strong> {alt.healthScore ? `${alt.healthScore} / 100` : "N/A"}</p>
                                                <p><strong>Reason:</strong> {alt.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No healthier alternatives provided.</p>
                                )}
                            </div>
                            {/* Future Impact */}
                            <div className="p-4 border rounded bg-gray-50">
                                <h4 className="font-medium">Future Impact</h4>
                                <p><strong>Long-Term Effect:</strong> {analysisResult.personalizedAnalysis.futureImpact?.longTermEffect || "N/A"}</p>
                                <p><strong>Weight Gain Risk:</strong> {analysisResult.personalizedAnalysis.futureImpact?.weightGainRisk || "N/A"}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
