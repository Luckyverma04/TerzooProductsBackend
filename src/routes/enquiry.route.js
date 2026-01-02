import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import{ upload } from "../middleware/upload.js";
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
} from "../controllers/enquiry.controller.js";

const router = express.Router();

// ================= WEBSITE =================
router.post("/", createEnquiry);

// ================= ADMIN =================
router.post("/manual", createManualLead);
router.post("/upload", protect, upload.single("file"), uploadLeadsCSV);
router.get("/", getAllEnquiries);
router.get("/:id", getEnquiryById);
router.get("/dashboard/summary", protect, dashboardSummary);

router.post("/:id/communication", protect, addCommunication);
router.get("/:id/communication", protect, getCommunications);
// ================= ASSOCIATE =================
router.put("/:id/status", updateLeadStatus);
router.put("/:id/assign", assignLeadToAssociate);
router.get("/my/leads",protect,getMyLeads);
export default router;
