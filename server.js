import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import connectDB from "./src/config/db.js";

import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import giftKitRoutes from "./src/routes/giftKit.route.js";

import { createDefaultAdmin } from "./src/controllers/user.controller.js";

/* ======================
   ENV CONFIG
====================== */
dotenv.config();

/* ======================
   DATABASE
====================== */
connectDB();

/* ======================
   APP INIT
====================== */
const app = express();

/* ======================
   CORS CONFIG
====================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://trazooglobal.com",
  "https://www.trazooglobal.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* ======================
   MIDDLEWARES
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.status(200).send("🚀 Trazoo backend running");
});

/* ======================
   INITIAL SETUP
====================== */
createDefaultAdmin();

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);
app.use("/api", giftKitRoutes);

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Backend live on port ${PORT}`);
});

/* ===================================================
   🔥 KEEP BACKEND ALIVE
=================================================== */

const BACKEND_URL = process.env.BACKEND_URL;

if (BACKEND_URL) {
  setInterval(async () => {
    try {
      await axios.get(BACKEND_URL);
      console.log("🔁 Keep-alive ping sent");
    } catch (error) {
      console.error("❌ Keep-alive failed:", error.message);
    }
  }, 10 * 60 * 1000);
}
