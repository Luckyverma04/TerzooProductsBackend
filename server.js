import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import productRoutes from "./src/routes/product.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";

// 🔹 Load ENV (Render ignores .env file, but safe for local)
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

// 🔹 CORS FIX (IMPORTANT)
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

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// 🔹 Create default admin (safe)
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
