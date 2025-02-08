"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const response = await fetch("http://localhost:5001/api/auth/register-step1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        
        
        const data = await response.json();
        setLoading(false);

        if (response.ok) {
            alert("Step 1 Completed! Proceed to Step 2");
            router.push(`/auth/signup/health?userId=${data.userId}`); // Redirect to step 2
        } else {
            alert(data.message || "Error in Step 1");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
            {/* Signup Card */}
            <div className="w-96 bg-white p-8 shadow-lg rounded-xl border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sign Up</h1>
                <p className="text-gray-500 text-center mb-4">Step 1: Account Details</p>
    
                <form onSubmit={handleStep1Submit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        required 
                    />
    
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-300">
                        {loading ? "Processing..." : "Next Step →"}
                    </button>
                </form>
    
                {/* Already have an account */}
                <p className="text-gray-500 text-center mt-4">
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-blue-500 hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
    
}
