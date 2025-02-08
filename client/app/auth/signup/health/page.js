"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

// ✅ Floating Animated Shapes Component
function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = "from-white/[0.08]" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
            animate={{ opacity: 1, y: 0, rotate }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={`absolute ${className}`}
        >
            <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{ width, height }}
                className="relative"
            >
                <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]`}
                />
            </motion.div>
        </motion.div>
    );
}


export default function HealthSignup() {
    const [formData, setFormData] = useState({
        age: "",
        gender: "Male",
        weight: "",
        height: "",
        activityLevel: "Sedentary",
        dietaryPreferences: "None",
        healthGoals: "General Wellness",
        allergies: [],
        medicalConditions: [],
    });

    const [userId, setUserId] = useState("");
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

    // ✅ Generic function to handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Function for pills/tags selection
    const handleTagClick = (name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: prevData[name].includes(value)
                ? prevData[name].filter((item) => item !== value)
                : [...prevData[name], value],
        }));
    };

    // ✅ Optimized submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch("http://localhost:5001/api/auth/register-step2", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, userId }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
            // ✅ Directly Redirect to Login Page After Success
            router.push("/auth/login");
        } else {
            // ✅ Show inline error message instead of alert
            setError(data.message || "Error in Step 2");
        }
    };


    // ✅ Form fields array (reusable for mapping inputs)
    const formFields = [
        { name: "age", type: "number", label: "Age" },
        { name: "weight", type: "number", label: "Weight (kg)" },
        { name: "height", type: "number", label: "Height (cm)" },
    ];

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
                <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
                <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
                <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
                <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />


            <div className="relative z-10 w-full max-w-4xl my-12 p-8 mx-4 rounded-xl backdrop-blur-md bg-black/70 shadow-2xl border border-gray-700">

                <h1 className="text-3xl font-bold tracking-tight text-white text-center">Sign Up</h1>
                <p className="text-gray-500 text-center mb-6">Step 2: Health Details</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    {/* Mapped Form Fields */}
                    {formFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <label htmlFor={field.name} className="text-gray-300">{field.label}:</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 placeholder:pl-4 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
                                required
                            />
                        </div>
                    ))}

                    {/* Gender */}
                    <SelectField
                        name="gender"
                        label="Gender"
                        options={["Male", "Female", "Other"]}
                        value={formData.gender}
                        onChange={handleChange}
                    />

                    {/* Activity Level */}
                    <SelectField
                        name="activityLevel"
                        label="Activity Level"
                        options={["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]}
                        value={formData.activityLevel}
                        onChange={handleChange}
                    />

                    {/* Dietary Preferences */}
                    <SelectField
                        name="dietaryPreferences"
                        label="Dietary Preferences"
                        options={["None", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"]}
                        value={formData.dietaryPreferences}
                        onChange={handleChange}
                    />

                    {/* Health Goals */}
                    <SelectField
                        name="healthGoals"
                        label="Health Goals"
                        options={["Weight Loss", "Muscle Gain", "General Wellness"]}
                        value={formData.healthGoals}
                        onChange={handleChange}
                    />

                    {/* Allergies Pills/Tags */}
                    <TagSelector
                        name="allergies"
                        label="Allergies"
                        options={["None", "Nuts", "Dairy", "Shellfish", "Eggs", "Wheat"]}
                        selectedValues={formData.allergies}
                        onTagClick={handleTagClick}
                    />

                    {/* Medical Conditions Pills/Tags */}
                    <TagSelector
                        name="medicalConditions"
                        label="Medical Conditions"
                        options={["None", "Diabetes", "Hypertension", "High Cholesterol", "Lactose Intolerance", "Celiac Disease", "PCOS", "Thyroid Issues", "Heart Disease", "Kidney Disease"]}
                        selectedValues={formData.medicalConditions}
                        onTagClick={handleTagClick}
                    />

                    {/* Submit Button */}
                    <div className="col-span-2 mt-4 flex justify-center">
                        <button
                            type="submit"
                            className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 rounded-full shadow-md transition-all transform hover:scale-105"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Complete Signup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ✅ Reusable Select Field Component
const SelectField = ({ name, label, options, value, onChange }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="text-gray-300">{label}:</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full w-full"
        >
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

// ✅ Reusable Tag Selector Component
const TagSelector = ({ name, label, options, selectedValues, onTagClick }) => (
    <div className="space-y-2 col-span-2">
        <label className="text-gray-300">{label}:</label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <span
                    key={option}
                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${selectedValues.includes(option) ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                        }`}
                    onClick={() => onTagClick(name, option)}
                >
                    {option}
                </span>
            ))}
        </div>
    </div>
);
