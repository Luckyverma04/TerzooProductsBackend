import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    company: {
      type: String,
    },

    location: {
      type: String,
    },

    lookingFor: {
      type: String,
    }
  },
  { timestamps: true } // you can remove this if you don't want createdAt/updatedAt
);

export default mongoose.model("Enquiry", enquirySchema);
