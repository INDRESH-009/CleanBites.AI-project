"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "react-select";

export default function HealthSignup() {
    const [userId, setUserId] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("Male");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [activityLevel, setActivityLevel] = useState("Sedentary");
    const [allergies, setAllergies] = useState([]); // ✅ Default as empty array
    const [medicalConditions, setMedicalConditions] = useState([]);
    
    // ✅ Add this missing useState
    const [dietaryPreferences, setDietaryPreferences] = useState("None");
    const [healthGoals, setHealthGoals] = useState("General Wellness");
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const id = searchParams.get("userId");
        if (!id) {
            alert("User ID missing, please restart signup.");
            router.push("/auth/signup");
        } else {
            setUserId(id);
        }
    }, [searchParams, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const requestData = {
            userId,
            age,
            gender,
            weight,
            height,
            activityLevel,
            dietaryPreferences,
            healthGoals,
            allergies, // ✅ Ensure it's an array
            medicalConditions // ✅ Ensure it's an array
        };
    
        console.log("🔍 Sending Data to Backend:", requestData); // ✅ Log before sending
    
        const response = await fetch("http://localhost:5001/api/auth/register-step2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        });
    
        const data = await response.json();
        setLoading(false);
    
        console.log("🔍 Backend Response:", data); // ✅ Log response
    
        if (response.ok) {
            alert("Signup Completed! Redirecting to Login.");
            router.push("/auth/login");
        } else {
            alert(data.message || "Error in Step 2");
        }
    };
    
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-6">
            {/* Signup Card */}
            <div className="w-full max-w-4xl bg-white p-8 shadow-lg rounded-xl border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Sign Up</h1>
                <p className="text-gray-500 text-center mb-6">Step 2: Health Details</p>
    
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    {/* Age */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Age:</label>
                        <input 
                            type="number" 
                            placeholder="Age" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            required 
                        />
                    </div>
    
                    {/* Gender */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Gender:</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none">
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
                            placeholder="Weight (kg)" 
                            value={weight} 
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            required 
                        />
                    </div>
    
                    {/* Height */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Height (cm):</label>
                        <input 
                            type="number" 
                            placeholder="Height (cm)" 
                            value={height} 
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            required 
                        />
                    </div>
    
                    {/* Activity Level */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Activity Level:</label>
                        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none">
                            <option value="Sedentary">Sedentary</option>
                            <option value="Lightly Active">Lightly Active</option>
                            <option value="Moderately Active">Moderately Active</option>
                            <option value="Very Active">Very Active</option>
                        </select>
                    </div>
    
                   {/* Allergies (Multi-Select) */}
<div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-1">Allergies:</label>
    <Select
        isMulti
        options={[
            { value: "None", label: "None" },
            { value: "Nuts", label: "Nuts" },
            { value: "Dairy", label: "Dairy" },
            { value: "Shellfish", label: "Shellfish" },
            { value: "Eggs", label: "Eggs" },
            { value: "Wheat", label: "Wheat" }
        ]}
        value={allergies.map(allergy => ({ value: allergy, label: allergy }))}
        onChange={(selected) => setAllergies(selected.map(option => option.value))}
        className="w-full"
    />
</div>

{/* Medical Conditions (Multi-Select) */}
<div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-1">Medical Conditions:</label>
    <Select
        isMulti
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
            { value: "Kidney Disease", label: "Kidney Disease" }
        ]}
        value={medicalConditions.map(condition => ({ value: condition, label: condition }))}
        onChange={(selected) => setMedicalConditions(selected.map(option => option.value))}
        className="w-full"
    />
</div>
    
                    {/* Dietary Preferences */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Dietary Preferences:</label>
                        <select value={dietaryPreferences} onChange={(e) => setDietaryPreferences(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none">
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
                        <select value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-400 focus:outline-none">
                            <option value="Weight Loss">Weight Loss</option>
                            <option value="Muscle Gain">Muscle Gain</option>
                            <option value="General Wellness">General Wellness</option>
                        </select>
                    </div>
    
                    {/* Submit Button */}
                    <div className="col-span-2 flex justify-center">
                        <button 
                            type="submit" 
                            className="w-full max-w-xs bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300">
                            {loading ? "Processing..." : "Complete Signup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
    
    
}
