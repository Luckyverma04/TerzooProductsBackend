import Enquiry from "../models/enquiry.model.js";
import nodemailer from "nodemailer";

// 📌 Email Sender Function
const sendUserEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"TRAZOO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Enquiry Has Been Received ✔",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for contacting <b>TRAZOO</b>!</p>
      <p>We have received your enquiry and our team will reach out to you within 24 hours.</p>
      <br/>
      <p>Best Regards,<br/>TRAZOO Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// 📌 CREATE ENQUIRY + SEND EMAIL
export const createEnquiry = async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);

    await enquiry.save();

    // Send Email to User
    await sendUserEmail(enquiry.email, enquiry.fullName);

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully! A confirmation email has been sent.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
