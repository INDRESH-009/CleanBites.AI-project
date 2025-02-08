"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Handle Login
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        setError("");

        try {
            // ✅ Send login request
            const res = await axios.post("http://localhost:5001/api/auth/login", { email, password });

            // ✅ Save token & user data in localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.user._id);
            localStorage.setItem("profileImage", res.data.user.profileImage || "default-profile.png");

            alert("Login successful!");

            // ✅ Redirect to Dashboard
            router.push("/dashboard");
        } catch (err) {
            console.error("❌ Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            {/* Login Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>

                {/* Show Error Message */}
                {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                <form className="space-y-4" onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Email Address:</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col">
                        <label className="font-semibold text-gray-700 mb-1">Password:</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Forgot Password & Login Button */}
                    <div className="flex items-center justify-between">
                        <a href="/forgot-password" className="text-blue-500 hover:underline text-sm">
                            Forgot Password?
                        </a>
                    </div>

                    {/* Login Button */}
                    <button 
                        type="submit"
                        className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>

                {/* Signup Redirect */}
                <p className="text-gray-600 text-center mt-4">
                    Don't have an account?{" "}
                    <a href="/auth/signup" className="text-blue-500 hover:underline">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
