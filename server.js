import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import connectDB from "./src/config/db.js";

import authRoute from "./src/routes/user.route.js";
import enquiryRoute from "./src/routes/enquiry.route.js";
import giftKitRoutes from "./src/routes/giftKit.route.js";
import { createDefaultAdmin } from "./src/controllers/user.controller.js";
import proposalRequestRoute from "./src/routes/proposalRequest.route.js";
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
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "20mb",
}));

/* ======================
   HEALTH CHECK
====================== */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Trazoo backend running",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoute);
app.use("/api/enquiry", enquiryRoute);
app.use("/api", giftKitRoutes);
app.use("/api/proposal-requests", proposalRequestRoute);

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`✅ Backend live on port ${PORT}`);
  
  // DELAY DE: DB properly connect ho jaye, phir admin check karna
  setTimeout(async () => {
    await createDefaultAdmin();
  }, 2000); // 2 second ka delay
});

/* ===================================================
   🔥 KEEP BACKEND ALIVE (RENDER SAFE)
=================================================== */

const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;

if (KEEP_ALIVE_URL) {
  setTimeout(() => {
    setInterval(async () => {
      try {
        await axios.get(KEEP_ALIVE_URL, { timeout: 5000 });
        console.log("🔁 Keep-alive ping success");
      } catch (error) {
        console.error("❌ Keep-alive failed:", error.message);
      }
    }, 5 * 60 * 1000);
  }, 10000);
}