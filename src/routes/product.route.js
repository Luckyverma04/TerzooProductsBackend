import express from "express";
import {
  createProduct,
  getProducts,
} from "../controllers/product.controller.js";

import { uploadProductImage } from "../middleware/upload.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  ADMIN only
 */
router.post(
  "/",
  protect,          // 🔐 JWT auth
  isAdmin,          // 👑 Admin check
  uploadProductImage, // 🖼️ Image upload
  createProduct
);

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get("/", getProducts);

export default router;
