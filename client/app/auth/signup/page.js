"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";

// ✅ Floating Animated Shapes (Same as Login Page)
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

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // ✅ Fixed: Instant Redirect without Alert
    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register-step1`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                // ✅ Redirect Immediately without Alert
                router.push(`/auth/signup/health?userId=${data.userId}`);
            } else {
                alert(data.message || "Error in Step 1");
            }
        } catch (error) {
            setLoading(false);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            {/* ✅ Background Gradient from Login Page */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

            {/* ✅ Floating Animated Shapes (Same as Login Page) */}
            <div className="absolute inset-0 overflow-hidden">
                <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
                <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
                <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
                <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
                <ElegantShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
            </div>

            {/* ✅ Signup Card (Styled Like Login Page) */}
            <div className="relative z-10 w-full max-w-md p-8 mx-auto rounded-xl backdrop-blur-md bg-black/70 shadow-2xl border border-gray-700">
                <div className="space-y-6">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Sign Up</h1>
                        <p className="text-gray-500">Step 1: Account Details</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleStep1Submit}>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">
                                Full Name:
                            </Label>
                            <Input
                                id="name"
                                placeholder="Enter your full name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-12 bg-black border border-gray-700 text-white placeholder-gray-400 placeholder:pl-4 pl-4 pr-4 focus:border-blue-500 focus:ring-blue-500 rounded-full"
                            />
                        </div>
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

                        {/* ✅ Signup Button Styled Like Login Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 rounded-full shadow-md transition-all transform hover:scale-105"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Next Step →"}
                        </Button>

                        {/* Already have an account */}
                        <div className="text-center text-gray-300">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
