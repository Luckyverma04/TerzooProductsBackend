import { User } from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// -----------------------------------------
// 📌 Send OTP Email using Nodemailer
// -----------------------------------------
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Trazoo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Email Verification OTP",
    html: `
      <h2>Your OTP is: <b>${otp}</b></h2>
      <p>OTP expires in 15 minutes.</p>
    `,
  });
};

// -----------------------------------------
// 📝 REGISTER USER (Send OTP)
// -----------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Create user → ALWAYS customer
    const user = new User({
      name,
      email,
      password,
      role: "customer", // 👈 Auto-assign
    });

    // Generate OTP
    const otp = user.generateOTP();

    // Save user
    await user.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      success: true,
      message: "User registered. OTP sent to email.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------
// 🔐 VERIFY EMAIL OTP
// -----------------------------------------
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpires");

    if (!user) return res.status(400).json({ message: "User not found" });

    const isValidOTP = user.verifyOTP(otp);
    if (!isValidOTP)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------
// 🔑 LOGIN USER
// -----------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isEmailVerified)
      return res.status(403).json({ message: "Email not verified" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -----------------------------------------
// 🛠 AUTO-CREATE DEFAULT ADMIN (ONLY ONCE)
// -----------------------------------------
export const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      const admin = new User({
        name: "Super Admin",
        email: "admin@trazoo.com",
        password: "Admin@123",
        role: "admin",
        isEmailVerified: true,
      });

      await admin.save();
      console.log("✔ Default Admin Created ➜ Email: admin@trazoo.com | Password: Admin@123");
    }
  } catch (error) {
    console.log("Admin creation error:", error.message);
  }
};
