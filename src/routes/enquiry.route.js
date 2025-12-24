import express from "express";
import { createEnquiry,getAllEnquiries
    ,getEnquiryById,
 } from "../controllers/enquiry.controller.js";

const router = express.Router();
router.post("/", createEnquiry);
router.get("/", getAllEnquiries);
router.get("/:id", getEnquiryById);
export default router;
