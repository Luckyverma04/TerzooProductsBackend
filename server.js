import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 FIRST load dotenv
dotenv.config({ path: path.join(__dirname, ".env") });

// 🔥 THEN check env
console.log("ENV CHECK:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "LOADED" : undefined,
});

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";
import productRoutes from "./src/routes/product.route.js";

// Connect DB
connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Create admin
createDefaultAdmin();

// ROUTES
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);
app.use("/api/products", productRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✔ Server running on: http://localhost:${PORT}`);
});
