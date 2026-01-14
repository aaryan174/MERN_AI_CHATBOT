import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import chatRoutes from "./routes/chat.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mern-ai-chatbot-theta.vercel.app",
  process.env.FRONTEND_URL // ✅ use env for production
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (any *.vercel.app domain)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Reject other origins
    const msg = "CORS policy does not allow this origin.";
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/home", chatRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Debug route to check environment variables (remove in production)
app.get("/api/debug/env", (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    hasMongoUrl: !!process.env.MONGODB_URL,
    port: process.env.PORT || 8080
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Failed to connect to DB", error);
  }
};
connectDB();

// Start server for local development
const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// ✅ Export app for Vercel
export default app;
