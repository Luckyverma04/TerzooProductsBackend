import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductsByBudget,
  getProductsByCategoryAndBudget,
  uploadBrandLogo,
  createKitEnquiry,
   getKitSuggestions,
    calculateKitPrice
} from "../controllers/giftKit.controller.js";

import { uploadProductImage } from "../middleware/upload.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* =======================
   PRODUCT ROUTES (ADMIN)
======================= */

router.post(
  "/products",
  protect,
  isAdmin,
  uploadProductImage,
  createProduct
);

router.get("/products", getAllProducts);

/* =======================
   USER TOOL ROUTES
======================= */

router.get("/products/budget/:budget", getProductsByBudget);

router.get("/products/filter", getProductsByCategoryAndBudget);

router.post("/upload/logo", uploadProductImage, uploadBrandLogo);

router.post("/kit-enquiry", createKitEnquiry);

router.get("/kit/suggestions", getKitSuggestions);

// Price preview
router.post("/kit/calculate-price", calculateKitPrice);
export default router;
