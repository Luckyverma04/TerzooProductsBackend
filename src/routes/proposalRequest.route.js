import express from "express";
import {
  createProposalRequest,
  getAllProposalRequests,
} from "../controllers/proposalRequest.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/", createProposalRequest);
router.get("/", protect, isAdmin, getAllProposalRequests);

export default router;