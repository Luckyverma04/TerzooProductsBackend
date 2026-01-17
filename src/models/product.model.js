import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String, // Cloudinary URLs
        required: true,
      },
    ],

    // Category (used in kit builder)
    category: {
      type: String,
      enum: ["Diary", "Pen", "Bottle", "Keychain", "Box"],
      required: true,
    },

    // Pricing
    unitPrice: {
      type: Number, // price per item (without GST)
      required: true,
    },

    brandingPrice: {
      type: Number, // optional logo branding cost per unit
      default: 0,
    },

    // MOQ rules
    minOrderQty: {
      type: Number,
      default: 20, // normal MOQ
    },

    customBrandingMOQ: {
      type: Number,
      default: null, // e.g. 100 for custom logo keychain
    },

    // Branding support
    brandingSupported: {
      type: Boolean,
      default: true,
    },

    // Budget visibility
    budgetTags: [
      {
        type: Number, // 300, 500, 800, 1000
      },
    ],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
