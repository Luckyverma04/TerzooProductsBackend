import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";

dotenv.config();

// Connect DB
connectDB();

const app = express();

// CORS FIX
app.use(
  cors({
    origin: "*", // FIX for Render deployment
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Create admin if not exists
createDefaultAdmin();

// ROUTES
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✔ Server running on: http://localhost:${PORT}`);
});
