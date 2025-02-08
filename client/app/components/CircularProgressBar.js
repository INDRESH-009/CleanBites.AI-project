import React from "react";

const CircularProgressBar = ({ label, value }) => {
    const radius = 45;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 5) * circumference; // Assuming max value is 5

    return (
        <div className="flex flex-col items-center">
            <svg width="100" height="100">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#4caf50"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <p className="text-lg font-semibold mt-2">{label}: {value}/5</p>
        </div>
    );
};

export default CircularProgressBar;
