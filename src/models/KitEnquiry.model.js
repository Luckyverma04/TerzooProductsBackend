import mongoose from "mongoose";

const kitEnquirySchema = new mongoose.Schema(
  {
    // User details
    name: String,
    email: String,
    phone: String,

    // Kit details
    budget: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 20,
    },

    selectedProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        category: String,
        price: Number,
      },
    ],

    // Logo
    brandLogo: {
      type: String, // Cloudinary URL
    },

    // Pricing
    perKitPrice: Number,
    totalPrice: Number,

    gstApplicable: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "won", "lost"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("KitEnquiry", kitEnquirySchema);
