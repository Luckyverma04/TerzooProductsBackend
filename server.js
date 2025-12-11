import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";

dotenv.config();

// -----------------------------
// 💾 Connect to MongoDB
// -----------------------------
connectDB();

const app = express();

// -----------------------------
// 🧩 Middlewares
// -----------------------------
app.use(cors());
app.use(express.json());

// -----------------------------
// 🔗 Default route
// -----------------------------
app.get("/", (req, res) => {
  res.send("Backend running...");
});

createDefaultAdmin(); 

// -----------------------------
// 📌 Enquiry API route
// /api/enquiry → POST request
// -----------------------------
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);

// -----------------------------
// 🚀 Start Server
// -----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("===============================================");
  console.log(`✔ Server running on:  http://localhost:${PORT}`);
  console.log(`✔ Environment:        ${process.env.NODE_ENV || "development"}`);
  console.log("===============================================\n");
});
