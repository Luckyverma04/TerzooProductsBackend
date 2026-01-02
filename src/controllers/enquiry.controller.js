import Enquiry from "../models/enquiry.model.js";
import nodemailer from "nodemailer";
import csv from "csv-parser";
import fs from "fs";
// ================= EMAIL =================
const sendUserEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"TRAZOO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Enquiry Has Been Received",
    html: `<p>Hello ${name}, we received your enquiry.</p>`,
  });
};

// ================= WEBSITE ENQUIRY =================
export const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create({
      ...req.body,
      leadSource: "WEBSITE",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
    });

    sendUserEmail(enquiry.email, enquiry.fullName)
      .catch(err => console.error("Email failed:", err.message));

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= ADMIN MANUAL LEAD =================
export const createManualLead = async (req, res) => {
  try {
    const lead = await Enquiry.create({
      ...req.body,
      leadSource: "SELF",
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ALL LEADS =================
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= GET BY ID =================
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= ASSOCIATE UPDATE =================
export const updateLeadStatus = async (req, res) => {
  try {
    const { callStatus, subStatus, finalStatus, comment } = req.body;

    const lead = await Enquiry.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (callStatus) lead.callStatus = callStatus;
    if (subStatus) lead.subStatus = subStatus;
    if (finalStatus) lead.finalStatus = finalStatus;

    lead.history.push({
      action: "STATUS_UPDATE",
      comment,
      by: req.user?.id || null,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================= ADMIN ASSIGN LEAD =================
export const assignLeadToAssociate = async (req, res) => {
  try {
    const { associateId } = req.body;

    const lead = await Enquiry.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.assignedTo = associateId;
    lead.status = "ACTIVE";

    lead.history.push({
      action: "LEAD_ASSIGNED",
      comment: "Lead assigned to associate",
      by: req.user?.id || null, // admin id
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= ASSOCIATE MY LEADS =================

// ================= GET MY LEADS (TOKEN BASED) =================
export const getMyLeads = async (req, res) => {
  try {
    // 🔥 req.user comes from token
    const leads = await Enquiry.find({
      assignedTo: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const uploadLeadsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const leads = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        /*
          Your CSV columns:
          company, name, mobile, email, address, pincode,
          city, website, category, State
        */

        const lead = {
          fullName: row.name?.trim() || "",
          phone: row.mobile?.trim() || "",
          email: row.email?.trim().toLowerCase() || "",
          company: row.company?.trim() || "",
          location: row.city?.trim() || row.State?.trim() || "",
          lookingFor: row.category?.trim() || "",
          leadSource: "SELF",
          status: "ACTIVE",
        };

        // ✅ Minimum condition: name OR phone hona chahiye
        if (lead.fullName || lead.phone) {
          leads.push(lead);
        }
      })
      .on("end", async () => {
        if (leads.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            success: false,
            message: "CSV processed but no usable data found",
          });
        }

        await Enquiry.insertMany(leads, { ordered: false });

        // 🧹 delete temp file
        fs.unlinkSync(req.file.path);

        res.status(201).json({
          success: true,
          message: "CSV uploaded successfully",
          inserted: leads.length,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DASHBOARD SUMMARY =================
export const dashboardSummary = async (req, res) => {
  try {
    const summary = {
      total: await Enquiry.countDocuments(),
      pending: await Enquiry.countDocuments({ status: "PENDING" }),
      active: await Enquiry.countDocuments({ status: "ACTIVE" }),
      converted: await Enquiry.countDocuments({ finalStatus: "CONVERTED" }),
      notInterested: await Enquiry.countDocuments({
        finalStatus: "NOT_INTERESTED",
      }),
    };

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ADD COMMUNICATION =================
export const addCommunication = async (req, res) => {
  try {
    const { type, message } = req.body;

    const lead = await Enquiry.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    lead.communications.push({
      type,
      message,
      sentBy: req.user._id,
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Communication logged successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET COMMUNICATION =================
export const getCommunications = async (req, res) => {
  try {
    const lead = await Enquiry.findById(req.params.id).populate(
      "communications.sentBy",
      "name email"
    );

    res.status(200).json({
      success: true,
      communications: lead.communications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

