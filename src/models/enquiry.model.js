import mongoose from "mongoose";

/* ================= COMMUNICATION LOG ================= */

const communicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["WHATSAPP", "EMAIL", "CALL"],
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================= HISTORY LOG ================= */

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      default: "",
    },

    comment: {
      type: String,
      default: "",
    },

    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================= ENQUIRY SCHEMA ================= */

const enquirySchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC LEAD INFORMATION
    // ==================================================

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // REQUIREMENT DETAILS
    // ==================================================

    lookingFor: {
      type: String,
      trim: true,
      default: "",
    },

    requirement: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      default: null,
    },

    requiredBy: {
      type: Date,
      default: null,
    },

    // ==================================================
    // STEP 2 REQUIREMENT DETAILS
    // ==================================================

    overallBudget: {
      type: String,
      default: "",
      trim: true,
    },

    deliveryRequirement: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================================
    // SOURCE IDENTIFIER
    // ==================================================

    leadSource: {
      type: String,
      enum: ["WEBSITE", "SELF", "DIGITAL"],
      default: "WEBSITE",
    },

    // ==================================================
    // LEAD FLOW STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACTIVE",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    finalStatus: {
      type: String,
      enum: [
        "IN_PROCESS",
        "NOT_INTERESTED",
        "CONVERTED",
      ],
      default: "IN_PROCESS",
    },

    // ==================================================
    // CALL TRACKING
    // ==================================================

    callStatus: {
      type: String,
      enum: [
        "CONNECTED",
        "DNP",
        "WRONG_NUMBER",
        "CALL_BACK",
      ],
      default: "DNP",
    },

    subStatus: {
      type: String,
      enum: [
        "PROSPECT",
        "NON_PROSPECT",
      ],
      default: "PROSPECT",
    },

    // ==================================================
    // ASSIGNMENT
    // ==================================================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==================================================
    // COMMUNICATION
    // ==================================================

    communications: {
      type: [communicationSchema],
      default: [],
    },

    // ==================================================
    // ACTIVITY HISTORY
    // ==================================================

    history: {
      type: [historySchema],
      default: [],
    },

    // ==================================================
    // DUPLICATE FLAG
    // ==================================================

    isDuplicate: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Enquiry", enquirySchema);