import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios"; // ✅ ADD
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import productRoutes from "./src/routes/product.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";

// 🔹 Load ENV
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// 🔹 Connect MongoDB
connectDB();

const app = express();

// 🔹 Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://trazooglobal.com",
  "https://www.trazooglobal.com",
];

// 🔹 CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 🔹 JSON Middleware
app.use(express.json());

// 🔹 Health Check (IMPORTANT FOR PING)
app.get("/", (req, res) => {
  res.status(200).send("Backend running 🚀");
});

// 🔹 Create default admin
createDefaultAdmin();

// 🔹 Routes
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);
app.use("/api/products", productRoutes);

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend live on port ${PORT}`);
});

// ===================================================
// 🔥 KEEP BACKEND ALIVE (AUTO PING EVERY 10 MINUTES)
// ===================================================

const BACKEND_URL = "https://YOUR_BACKEND_NAME.onrender.com"; 
// ⚠️ apna REAL deployed backend URL yaha daalna

setInterval(async () => {
  try {
    await axios.get(BACKEND_URL);
    console.log("🔁 Keep-alive ping sent");
  } catch (error) {
    console.error("❌ Keep-alive failed:", error.message);
  }
}, 10 * 60 * 1000); // ⏱️ 10 minutes
