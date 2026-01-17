import express from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  getAllUsers,
  getUserById,
  getDashboardSummary,
  getMe
} from "../controllers/user.controller.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

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
router.get("/me", protect, getMe);
// -----------------------------------------
// 🔑 Login User
// Endpoint: POST /api/auth/login
// -----------------------------------------
router.post("/login", loginUser);
router.get("/all", protect, isAdmin, getAllUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.get("/dashboard/summary", protect, isAdmin, getDashboardSummary);

export default router;
