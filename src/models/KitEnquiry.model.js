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

    // ============================================================
    // Every value every button in the entire app actually sends:
    //
    //   KitEnquiries page (lowercase):    "contacted","completed","cancelled"
    //   AdminLeadDetails (UPPERCASE):     "ACTIVE","CONFIRMED","COMPLETED","CANCELLED"
    //   Original legacy defaults:         "new","quoted","won","lost"
    // ============================================================
    status: {
      type: String,
      enum: [
        // legacy
        "new",
        "contacted",
        "quoted",
        "won",
        "lost",
        // KitEnquiries page buttons (lowercase) ← these two were missing
        "pending",
        "completed",
        "cancelled",
        // AdminLeadDetails quick-action buttons (UPPERCASE)
        "PENDING",
        "ACTIVE",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "new",
    },

    // history — pushed on every status change so activity log works
    history: [
      {
        action: { type: String },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// prevents OverwriteModelError if imported more than once
export default mongoose.models.KitEnquiry || mongoose.model("KitEnquiry", kitEnquirySchema);