import mongoose from "mongoose";

const proposalRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    programme: {
      type: String,
      trim: true,
      default: "",
    },
    qty: {
      type: Number,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    brief: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProposalRequest", proposalRequestSchema);
