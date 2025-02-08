"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';

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
        const formData = new FormData();
        formData.append("file", image);

        try {
            const response = await axios.post("http://localhost:5001/api/vision", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (!user) {
                throw new Error("User data not loaded correctly");
            }

            const analysisResponse = await axios.post("http://localhost:5001/api/analyze-food", {
                userId: user?._id,
                extractedText: response.data.fullText
            });

            setAnalysisResult(analysisResponse.data.analysis);
        } catch (error) {
            console.error("Error processing image:", error);
            alert("Failed to process the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const macroColors = {
        Carbohydrates: "#FFD700", // Gold
        Fats: "#FF4500", // Orange Red
        Proteins: "#32CD32", // Lime Green
        Fiber: "#1E90FF" // Dodger Blue
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 w-full">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                <h2 className="text-xl font-bold text-gray-800">Upload Food Image</h2>
                <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4 border p-2 rounded w-full" />
                {preview && <img src={preview} alt="Preview" className="w-full max-h-60 object-contain border mb-4" />}
                <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    {loading ? "Processing..." : "Analyze Food"}
                </button>
            </div>

            {analysisResult && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-3xl text-gray-900">
                <h2 className="text-2xl font-bold text-green-700 mb-4">AI Food Analysis</h2>
            
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded bg-gray-50 font-medium">
                        <strong>Total Calories:</strong> {analysisResult.calories || "Data not available"}
                    </div>
                    <div className="p-4 border rounded bg-gray-50 font-medium">
                        <strong>Processing Level:</strong> {analysisResult.processingLevel || "Data not available"}
                    </div>
                    <div className="p-4 border rounded bg-gray-50 font-medium">
                        <strong>Health Score:</strong> {analysisResult.healthScore}/100
                    </div>
                    <div className="p-4 border rounded bg-gray-50 font-medium">
                        <strong>Carbon Footprint:</strong> {analysisResult.carbonFootprint || "Data not available"}
                    </div>
                </div>
            
                {/* Macronutrient Score Bars */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {["Carbohydrates", "Fats", "Proteins"].map((macro) => (
                        <div key={macro} className="flex flex-col items-center">
                            <div className="w-full bg-gray-300 rounded-full h-6">
                                <div className={`h-6 rounded-full ${macro === "Carbohydrates" ? "bg-green-500" : macro === "Fats" ? "bg-yellow-500" : "bg-blue-500"}`} 
                                    style={{ width: `${analysisResult.macros[macro].score * 10}%` }}>
                                </div>
                            </div>
                            <p className="text-center text-gray-700 mt-2 font-semibold">{macro}: {analysisResult.macros[macro].quantity}g</p>
                        </div>
                    ))}
                </div>
            
                {/* Sugar Content */}
                <div className="p-4 border rounded bg-gray-50 mt-4">
                    <strong>Sugar Content:</strong> {analysisResult.sugarContent.totalSugar}g
                    <br />
                    <strong>Contributing Ingredients:</strong> {analysisResult.sugarContent.sugarSources.join(", ")}
                </div>
            
                {/* Personalized Suggestions */}
                <div className="p-4 border rounded bg-gray-50 mt-4">
                    <strong>Personalized Suggestions:</strong>
                    <ul className="list-disc ml-6">
                        {analysisResult.personalizedSuggestions.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
            )}
        </div>
    );
}
