import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// -----------------------------------------
// 📝 Register User (Send OTP)
// Endpoint: POST /api/auth/register
// -----------------------------------------
router.post("/register", registerUser);

// -----------------------------------------
// 🔐 Verify OTP
// Endpoint: POST /api/auth/verify-otp
// -----------------------------------------
router.post("/verify-otp", verifyEmail);

// -----------------------------------------
// 🔑 Login User
// Endpoint: POST /api/auth/login
// -----------------------------------------
router.post("/login", loginUser);

export default router;
