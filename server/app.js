import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth.route.js";
import visionRoutes from "./src/routes/vision.route.js"; 
import foodScanRoutes from "./src/routes/foodScan.route.js";
import foodAnalysisRoutes from "./src/routes/foodAnalysis.route.js"; // ✅ New AI Analysis Route
import userRoutes from "./src/routes/user.route.js";
import updateHealthRoutes from "./src/routes/updateHealth.route.js";
import chatRoutes from "./src/routes/chat.route.js";


// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error: ", err));

const app = express();

// ✅ Fix CORS issue by applying it globally
app.use(cors({
  origin: "http://192.168.217.230:3000", // Allow Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (if needed)
}));

// ✅ Explicitly handle OPTIONS preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/vision", visionRoutes);
app.use('/api/foodscan', foodScanRoutes);
app.use("/api/analyze-food", foodAnalysisRoutes); // ✅ Mount AI Analysis Route
app.use("/api/users", userRoutes);
app.use("/api", updateHealthRoutes);
app.use("/api/chat", chatRoutes); 

// ✅ Root Endpoint
app.get("/", (req, res) => {
    res.send("Welcome to CleanBites API");
});

export default app;