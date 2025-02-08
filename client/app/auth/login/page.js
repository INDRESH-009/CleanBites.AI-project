"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

// ✅ Elegant background animation from Landing Page
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

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // ✅ Send login request
            const res = await axios.post("http://localhost:5001/api/auth/login", { email, password });

            // ✅ Save token & user data in localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.user._id);
            localStorage.setItem("profileImage", res.data.user.profileImage || "default-profile.png");

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
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            {/* ✅ Background Gradient from Landing Page */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

            {/* ✅ Floating Animated Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
                <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
                <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
                <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
                <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
            </div>

            {/* ✅ Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 mx-auto rounded-xl backdrop-blur-md bg-black/70 shadow-2xl border border-gray-700">
                <div className="space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Login</h1>
                    </div>

                    {/* Show Error Message */}
                    {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                                Email Address:
                            </Label>
                            <Input
                                id="email"
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 placeholder:pl-4 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">
                                Password:
                            </Label>
                            <Input
                                id="password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 placeholder:pl-4 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full"
                            />
                        </div>

                        {/* ✅ Enhanced Login Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 rounded-full shadow-md transition-all transform hover:scale-105"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Login"}
                        </Button>

                        {/* Signup Redirect */}
                        <div className="text-center text-gray-300">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
