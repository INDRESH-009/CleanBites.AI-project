"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to CleanBitesAI</h1>
            <p className="text-lg text-gray-600 mb-6">Your personalized AI for healthy eating.</p>
            <div className="flex space-x-4">
                <button 
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                    onClick={() => router.push("/auth/login")}
                >
                    Login
                </button>
                <button 
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
                    onClick={() => router.push("/auth/signup")}
                >
                    Signup
                </button>
            </div>
        </div>
    );
}