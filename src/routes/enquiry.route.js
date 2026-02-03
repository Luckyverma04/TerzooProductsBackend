import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.js";

import {
  createEnquiry,
  createManualLead,
  getAllEnquiries,
  getEnquiryById,
  updateLeadStatus,
  assignLeadToAssociate,
  getMyLeads,
  uploadLeadsCSV,
  dashboardSummary,
  addCommunication,
  getCommunications,
  assignBulkLeads,
} from "../controllers/enquiry.controller.js";

const router = express.Router();

/* ================= WEBSITE ================= */
router.post("/", createEnquiry);

/* ================= ADMIN DASHBOARD ================= */

// 🔥 Dashboard summary (must be before "/:id")
router.get("/dashboard/summary", protect, dashboardSummary);

// 🔥 CSV upload
router.post("/upload", protect, upload.single("file"), uploadLeadsCSV);

// 🔥 Manual lead create
router.post("/manual", protect, createManualLead);

// 🔥 PAGINATED ENQUIRIES LIST (MAIN FIX)
router.get("/", protect, getAllEnquiries);

// 🔥 Bulk assign
router.post("/assign/bulk", protect, assignBulkLeads);

/* ================= COMMUNICATION ================= */
router.post("/:id/communication", protect, addCommunication);
router.get("/:id/communication", protect, getCommunications);

/* ================= ASSOCIATE ================= */
router.get("/my/leads", protect, getMyLeads);
router.put("/:id/status", protect, updateLeadStatus);
router.put("/:id/assign", protect, assignLeadToAssociate);

/* ================= SINGLE ENQUIRY (ALWAYS LAST) ================= */
router.get("/:id", protect, getEnquiryById);

export default router;
