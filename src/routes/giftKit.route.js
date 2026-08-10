import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  toggleProductStatus,
  getKitSuggestions,
  calculateKitPrice,
} from "../controllers/giftKit.controller.js";

import {
  createKitEnquiry,
   createCustomizationEnquiry, 
  getAllKitEnquiries,
  getKitEnquiryById,
  updateKitEnquiryStatus,
} from "../controllers/kitEnquiry.controller.js";

import { uploadProductImage } from "../middleware/upload.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

/* ========= PRODUCTS ========= */
router.post("/products", protect, isAdmin, uploadProductImage, createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", protect, isAdmin, updateProduct);
router.patch("/products/:id/toggle", protect, isAdmin, toggleProductStatus);

/* ========= KIT TOOL ========= */
router.get("/kit/suggestions", getKitSuggestions);
router.post("/kit/calculate-price", calculateKitPrice);

/* ========= ENQUIRY ========= */
router.post("/kit-enquiry", createKitEnquiry);
router.post(
  "/kit-enquiry/customization",
  createCustomizationEnquiry
);
router.get("/kit-enquiry", protect, isAdmin, getAllKitEnquiries);
router.get("/kit-enquiry/:id", protect, isAdmin, getKitEnquiryById);
router.patch(
  "/kit-enquiry/:id/status",
  protect,
  isAdmin,
  updateKitEnquiryStatus
);

export default router;
