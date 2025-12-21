import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import productRoutes from "./src/routes/product.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";

// Load env only in local
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Connect DB
connectDB();

const app = express();

// Secure CORS
const allowedOrigins = [
  "https://trazooglobal.com",
  "https://www.trazooglobal.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Health route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Create admin
createDefaultAdmin();

// Routes
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);
app.use("/api/products", productRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✔ Backend live on port ${PORT}`);
});
