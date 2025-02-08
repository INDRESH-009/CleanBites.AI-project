import express from "express";
import multer from "multer";
import vision from "@google-cloud/vision";
import fs from "fs";
import path from "path";
import * as Jimp from "jimp"; // ✅ Correct way for ESM
const { read } = Jimp; // ✅ Fix for Jimp.read()



const router = express.Router();

// Configure Multer for file upload
const upload = multer({ dest: "uploads/" });

// Load Google Vision API client
const client = new vision.ImageAnnotatorClient({
    keyFilename: path.resolve("./cleanbites-ai-1689dde97a8b.json") // ✅ Ensure correct path
});

// Function to preprocess image
const preprocessImage = async (filePath) => {
    try {
        const image = await read(filePath); // ✅ Use destructured read() function
        await image
            .greyscale()
            .contrast(0.8)
            .normalize()
            .resize(1500, Jimp.AUTO)
            .quality(100)
            .writeAsync(filePath);
    } catch (err) {
        console.error("🚨 Jimp Processing Error:", err);
    }
};


router.post("/", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        // Preprocess image before OCR
        await preprocessImage(req.file.path);

        // Perform text detection (use `documentTextDetection` for structured text)
        const [result] = await client.documentTextDetection(req.file.path);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return res.status(400).json({ error: "No text detected" });
        }

        // Full text extraction (for debugging)
        const extractedText = detections[0].description;
        console.log("🔹 Extracted Text:", extractedText); // ✅ Log extracted text

        // Process extracted text to find relevant information
        const productNameMatch = extractedText.match(/^(.+?)\n/);
        const ingredientsMatch = extractedText.match(/ingredients[:\s]([\s\S]*?)(?:\n\n|\n[A-Z]|\n$)/i);
        const nutritionalInfoMatch = extractedText.match(/(Nutrition Facts|Nutritional Information)[:\s]([\s\S]*?)(?:\n\n|\n[A-Z]|\n$)/i);

        // Extract matched text
        const productName = productNameMatch ? productNameMatch[1].trim() : "Not Found";
        let ingredients = ingredientsMatch ? ingredientsMatch[1].trim() : "Not Found";
        let nutritionalInfo = nutritionalInfoMatch ? nutritionalInfoMatch[2].trim() : "Not Found";

        // ✅ Clean up extracted text (remove extra spaces, unwanted symbols)
        ingredients = ingredients.replace(/\s{2,}/g, " ").replace(/\*/g, ""); 
        nutritionalInfo = nutritionalInfo.replace(/\s{2,}/g, " ").replace(/\*/g, "");

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            productName,
            ingredients,
            nutritionalInfo,
            fullText: extractedText // ✅ Send full extracted text for debugging
        });

    } catch (error) {
        console.error("🚨 Google Vision API Error:", error);
    
        // Check if API response has an error message
        if (error.response) {
            console.error("🔹 Error Response Data:", error.response.data);
        }
    
        res.status(500).json({ 
            error: "Failed to process image", 
            details: error.message, 
            fullError: error.response ? error.response.data : "No API response" 
        });
    }
});

export default router;
