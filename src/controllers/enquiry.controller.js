import Enquiry from "../models/enquiry.model.js";
import nodemailer from "nodemailer";

// 📌 Email sender
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
    subject: "Your Enquiry Has Been Received ✔",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for contacting <b>TRAZOO</b>.</p>
      <p>We will reach out to you within 24 hours.</p>
      <br/>
      <p>Regards,<br/>TRAZOO Team</p>
    `,
  });
};

// 📌 Create Enquiry
export const createEnquiry = async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();

    // ✅ RESPONSE IMMEDIATELY
    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
    });

    // 🔥 EMAIL BACKGROUND ME (no await)
    sendUserEmail(enquiry.email, enquiry.fullName)
      .then(() => console.log("Email sent"))
      .catch((err) => console.error("Email failed:", err.message));

  } catch (error) {
    console.error("ENQUIRY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
