"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import EditProfileModal from "./EditProfileModal";
import { Activity, AlertCircle, Ruler, Scale, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // Modal visibility state

    const [formData, setFormData] = useState({
        age: "",
        weight: "",
        height: "",
        activityLevel: "Sedentary",
        gender: "Male",
        allergies: [], // Default as an empty array
        medicalConditions: [],
        dietaryPreferences: "None",
        healthGoals: "General Wellness",
    });

    const [metrics, setMetrics] = useState({
        bmi: null,
        bmr: null,
        tdee: null,
        macronutrients: { proteins: null, fats: null, carbohydrates: null }
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    // Fetch User Data
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please log in again.");
                return;
            }

            const response = await axios.get("http://localhost:5001/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.data || !response.data._id) {
                alert("Failed to fetch user data.");
                return;
            }

            setUser(response.data);

            setFormData({
                age: response.data.healthDetails?.age || "",
                weight: response.data.healthDetails?.weight || "",
                height: response.data.healthDetails?.height || "",
                activityLevel: response.data.healthDetails?.activityLevel || "Sedentary",
                gender: response.data.healthDetails?.gender || "Male",
                allergies: Array.isArray(response.data.healthDetails?.allergies)
                    ? response.data.healthDetails.allergies
                    : [],
                medicalConditions: Array.isArray(response.data.healthDetails?.medicalConditions)
                    ? response.data.healthDetails.medicalConditions
                    : [],
                dietaryPreferences: response.data.healthDetails?.dietaryPreferences || "None",
                healthGoals: response.data.healthDetails?.healthGoals || "General Wellness",
            });

            setMetrics({
                bmi: response.data.bmi,
                bmr: response.data.bmr,
                tdee: response.data.tdee,
                macronutrients: response.data.macronutrients || { proteins: null, fats: null, carbohydrates: null }
            });

            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            alert("Failed to load user data.");
            setLoading(false);
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submission (Update Health Details)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("User is not authenticated. Please login again.");
                return;
            }

            if (!user || !user._id) {
                alert("User data is not available. Please refresh the page.");
                return;
            }

            console.log("📤 Sending update-health request:", { userId: user._id, ...formData });

            const response = await axios.post("http://localhost:5001/api/update-health",
                { userId: user._id, ...formData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message || "Health details updated successfully!");

            if (response.data.metrics) {
                setMetrics(response.data.metrics);
            }

            fetchUserData();
            setIsEditing(false);
        } catch (error) {
            console.error("❌ Error updating health details:", error.response?.data || error.message);
            alert("Failed to update health details.");
        }
    };

    if (loading) return <p className="text-gray-500 text-center">Loading profile...</p>;
    if (!user) return <p className="text-red-500 text-center">User data could not be loaded. Please log in again.</p>;

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-black">
            <div className="mx-auto max-w-6xl">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold text-white text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    User Profile
                </motion.h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Health Metrics Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-black border border-gray-800 shadow-lg backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white flex items-center gap-2">
                                    <Activity className="h-6 w-6 text-blue-400" />
                                    Health Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-4">
                                    {[
                                        { label: "BMI", value: metrics.bmi != null ? metrics.bmi.toFixed(2) : "N/A", color: "text-indigo-400" },
                                        { label: "BMR", value: metrics.bmr != null ? metrics.bmr.toFixed(2) + " kcal/day" : "N/A", color: "text-yellow-400" },
                                        { label: "TDEE", value: metrics.tdee != null ? metrics.tdee.toFixed(2) + " kcal/day" : "N/A", color: "text-green-400" }
                                    ].map((metric) => (
                                        <div
                                            key={metric.label}
                                            className="bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700/70 transition-colors"
                                        >
                                            <div className={`text-sm ${metric.color}`}>{metric.label}</div>
                                            <div className="text-xl font-semibold text-white">{metric.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Macronutrients (Daily Intake)</h3>
                                    <div className="grid gap-3">
                                        {[
                                            { label: "Proteins", value: metrics.macronutrients.proteins != null ? metrics.macronutrients.proteins.toFixed(2) + " g" : "N/A", color: "text-blue-400" },
                                            { label: "Fats", value: metrics.macronutrients.fats != null ? metrics.macronutrients.fats.toFixed(2) + " g" : "N/A", color: "text-yellow-400" },
                                            { label: "Carbohydrates", value: metrics.macronutrients.carbohydrates != null ? metrics.macronutrients.carbohydrates.toFixed(2) + " g" : "N/A", color: "text-orange-400" }
                                        ].map((macro) => (
                                            <div
                                                key={macro.label}
                                                className="flex justify-between items-center bg-gray-700/30 p-3 rounded-md"
                                            >
                                                <span className={macro.color}>{macro.label}</span>
                                                <span className="text-white font-medium">{macro.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* User Details Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-black border border-gray-800 shadow-lg backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white flex items-center gap-2">
                                    <User2 className="h-6 w-6 text-blue-400" />
                                    User Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">{user.name ? user.name.charAt(0) : "?"}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-purple-400">Name</div>
                                            <div className="text-xl font-semibold text-white">{user.name}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 bg-gray-700/30 p-3 rounded-md">
                                            <Ruler className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-cyan-400">Height</div>
                                                <div className="text-white">{formData.height ? formData.height + " cm" : "Not set"}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-700/30 p-3 rounded-md">
                                            <Scale className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-emerald-400">Weight</div>
                                                <div className="text-white">{formData.weight ? formData.weight + " kg" : "Not set"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                                            <span className="text-orange-400">Allergies:</span>
                                            <span className="text-white">{Array.isArray(formData.allergies) && formData.allergies.length > 0 ? formData.allergies.join(", ") : "None"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-400" />
                                            <span className="text-red-400">Medical Conditions:</span>
                                            <span className="text-white">{Array.isArray(formData.medicalConditions) && formData.medicalConditions.length > 0 ? formData.medicalConditions.join(", ") : "None"}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                    variant="secondary"
                                >
                                    Edit Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Extracted Edit Modal Component */}
            {isEditing && (
                <EditProfileModal
                    formData={formData}
                    setFormData={setFormData}
                    setIsEditing={setIsEditing}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                />
            )}
        </div>
    );
};

export default ProfilePage;
