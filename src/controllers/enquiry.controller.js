import Enquiry from "../models/enquiry.model.js";
import nodemailer from "nodemailer";

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

export const createEnquiry = async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();

    // ✅ SEND RESPONSE FIRST
    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
    });

    // 🔥 EMAIL BACKGROUND (NO BLOCK)
    sendUserEmail(enquiry.email, enquiry.fullName)
      .catch((err) => console.error("Email failed:", err.message));

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
