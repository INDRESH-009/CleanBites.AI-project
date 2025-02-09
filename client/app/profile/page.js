"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // 🔹 Modal visibility state

    const [formData, setFormData] = useState({
        age: "",
        weight: "",
        height: "",
        activityLevel: "Sedentary",
        gender: "Male",
        allergies: [], // ✅ Default as an empty array
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

    // ✅ Fetch User Data
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
                    : [], // ✅ Ensure it's always an array
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

    // ✅ Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Handle Form Submission (Update Health Details)
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
    
            // ✅ Update Metrics in State Dynamically
            if (response.data.metrics) {
                setMetrics(response.data.metrics);
            }
    
            // ✅ Re-fetch User Data to Ensure Frontend is Updated
            fetchUserData();
            setIsEditing(false); // Close modal after saving
    
        } catch (error) {
            console.error("❌ Error updating health details:", error.response?.data || error.message);
            alert("Failed to update health details.");
        }
    };
    

    if (loading) return <p className="text-gray-500 text-center">Loading profile...</p>;

    if (!user) return <p className="text-red-500 text-center">User data could not be loaded. Please log in again.</p>;

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-8 border border-gray-200">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">User Profile</h1>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ✅ Left Section - Health Metrics */}
                <div className="p-6 bg-gray-200 rounded-xl shadow-lg border border-gray-400">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Health Metrics</h2>
                    <p className="text-lg text-gray-800"><strong>BMI:</strong> {metrics.bmi?.toFixed(2) || "N/A"}</p>
                    <p className="text-lg text-gray-800"><strong>BMR:</strong> {metrics.bmr?.toFixed(2) || "N/A"} kcal/day</p>
                    <p className="text-lg text-gray-800"><strong>TDEE:</strong> {metrics.tdee?.toFixed(2) || "N/A"} kcal/day</p>
    
                    <h3 className="text-xl font-semibold mt-5 text-gray-900">Macronutrients (Daily Intake)</h3>
                    <p className="text-lg text-gray-800"><strong>Proteins:</strong> {metrics.macronutrients.proteins?.toFixed(2) || "N/A"} g</p>
                    <p className="text-lg text-gray-800"><strong>Fats:</strong> {metrics.macronutrients.fats?.toFixed(2) || "N/A"} g</p>
                    <p className="text-lg text-gray-800"><strong>Carbohydrates:</strong> {metrics.macronutrients.carbohydrates?.toFixed(2) || "N/A"} g</p>
                </div>
    
                {/* ✅ Right Section - User Details */}
                <div className="p-6 bg-gray-100 rounded-xl shadow-lg border border-gray-400">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">User Details</h2>
                    <p className="text-lg text-gray-800"><strong>Name:</strong> {user.name}</p>
                    
                    <p className="text-lg text-gray-800"><strong>Age:</strong> {formData.age}</p>
                    <p className="text-lg text-gray-800"><strong>Height:</strong> {formData.height} cm</p>
                    <p className="text-lg text-gray-800"><strong>Weight:</strong> {formData.weight} kg</p>
                    <p className="text-lg text-gray-800"><strong>Allergies:</strong> {Array.isArray(formData.allergies) && formData.allergies.length > 0 ? formData.allergies.join(", ") : "None"}</p>
                    <p className="text-lg text-gray-800"><strong>Medical Conditions:</strong> {Array.isArray(formData.medicalConditions) && formData.medicalConditions.length > 0 ? formData.medicalConditions.join(", ") : "None"}</p>
    
                    <button onClick={() => setIsEditing(true)} className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 w-full">
                        Edit
                    </button>
                </div>
            </div>
    
            {/* ✅ Modal for Editing */}
           {/* ✅ Modal for Editing */}
{isEditing && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl border border-gray-300">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Update Health Details</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                {/* Age */}
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-1">Age:</label>
                    <input 
                        type="number" 
                        name="age"
                        value={formData.age} 
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                        required 
                    />
                </div>

                {/* Gender */}
                <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>
    </div>


                {/* Weight */}
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-1">Weight (kg):</label>
                    <input 
                        type="number" 
                        name="weight"
                        value={formData.weight} 
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                        required 
                    />
                </div>

                {/* Height */}
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-1">Height (cm):</label>
                    <input 
                        type="number" 
                        name="height"
                        value={formData.height} 
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                        required 
                    />
                </div>

                {/* Activity Level */}
                <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Activity Level:</label>
        <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900">
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly Active">Lightly Active</option>
            <option value="Moderately Active">Moderately Active</option>
            <option value="Very Active">Very Active</option>
        </select>
    </div>

                {/* Allergies Dropdown (Multi-select) */}
                <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-1">Allergies:</label>
    <Select
        isMulti
        name="allergies"
        options={[
            { value: "None", label: "None" },
            { value: "Nuts", label: "Nuts" },
            { value: "Dairy", label: "Dairy" },
            { value: "Shellfish", label: "Shellfish" },
            { value: "Eggs", label: "Eggs" },
            { value: "Soy", label: "Soy" },
            { value: "Wheat", label: "Wheat" },
        ]}
        value={formData.allergies.map(allergy => ({ value: allergy, label: allergy }))}
        onChange={(selected) => setFormData({
            ...formData,
            allergies: selected.map(option => option.value)
        })}
        className="w-full"
    />
</div>

                 {/* Medical Conditions Dropdown (Multi-select) */}
  {/* Medical Conditions Multi-Select Dropdown */}
<div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-1">Medical Conditions:</label>
    <Select
        isMulti
        name="medicalConditions"
        options={[
            { value: "None", label: "None" },
            { value: "Diabetes", label: "Diabetes" },
            { value: "Hypertension", label: "Hypertension" },
            { value: "High Cholesterol", label: "High Cholesterol" },
            { value: "Lactose Intolerance", label: "Lactose Intolerance" },
            { value: "Celiac Disease", label: "Celiac Disease" },
            { value: "PCOS", label: "PCOS" },
            { value: "Thyroid Issues", label: "Thyroid Issues" },
            { value: "Heart Disease", label: "Heart Disease" },
            { value: "Kidney Disease", label: "Kidney Disease" },
        ]}
        value={formData.medicalConditions.map(condition => ({ value: condition, label: condition }))}
        onChange={(selected) => setFormData({
            ...formData,
            medicalConditions: selected.map(option => option.value)
        })}
        className="w-full"
    />
</div>
                 {/* Dietary Preferences */}
    <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-1">Dietary Preferences:</label>
        <select name="dietaryPreferences" value={formData.dietaryPreferences} onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900">
            <option value="None">None</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Gluten-Free">Gluten-Free</option>
            <option value="Keto">Keto</option>
            <option value="Paleo">Paleo</option>
        </select>
    </div>
                {/* Health Goals */}
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-1">Health Goals:</label>
                    <select name="healthGoals" value={formData.healthGoals} onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-900">
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="General Wellness">General Wellness</option>
                        <option value="Low-Sodium Diet">Low-Sodium Diet</option>
                        <option value="Heart Health">Heart Health</option>
                        <option value="Diabetes Management">Diabetes Management</option>
                    </select>
                </div>

                {/* Submit Button */}
                <div className="col-span-2 flex justify-center gap-4 mt-4">
                    <button type="submit" className="w-1/2 bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300">
                        Save Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} type="button" className="w-1/2 bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

        </div>
    );
    
};
export default ProfilePage;