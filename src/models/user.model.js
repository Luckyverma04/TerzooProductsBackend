import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const UserRole = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },

    // OTP verification fields
    otp: String,
    otpExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

//
// 🔐 Password Hashing (before save)
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//
// 🔑 Compare Password (Login)
//
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//
// ✉️ Generate OTP for Email Verification
//
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return otp; // return plain OTP for sending via email
};

//
// 🔍 Verify OTP Method
//
userSchema.methods.verifyOTP = function (enteredOtp) {
  const hashedOtp = crypto.createHash("sha256").update(enteredOtp).digest("hex");
  return this.otp === hashedOtp && this.otpExpires > Date.now();
};

export const User = mongoose.model("User", userSchema);
