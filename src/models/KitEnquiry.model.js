import mongoose from "mongoose";

const kitEnquirySchema = new mongoose.Schema(
  {
    // User details
    name: String,
    email: String,
    phone: String,

    // Kit details
    // NOTE: was `required: true`. Made optional at the schema level and
    // enforced conditionally in the controller (kit-builder flow still
    // requires it, same as before) so the Customisation flow — which has
    // no budget/pricing step — can reuse this same model without sending one.
    budget: {
      type: Number,
      required: false,
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

    // Logo — Cloudinary URL (uploaded via your existing upload flow,
    // same as the kit-builder already does)
    brandLogo: {
      type: String,
    },

    // ---- NEW: Customisation-page fields ----

    // Free-text customization instructions
    notes: {
      type: String,
    },

    // Optional reference image showing what they want customized —
    // Cloudinary URL, kept separate from brandLogo so both flows coexist
    referenceImage: {
      type: String,
    },

    // What kind of customization is being requested.
    // Required only when requestType === "customization".
    customizationType: {
      type: String,
      enum: ["logo_printing", "color_change", "packaging", "material", "other"],
    },

    // Whether they want their logo placed on the product — drives
    // whether the frontend requires the logo upload
    needsLogo: {
      type: Boolean,
      default: false,
    },

    // Which flow created this doc, so the admin UI can tell them apart
    requestType: {
      type: String,
      enum: ["kit", "customization"],
      default: "kit",
    },

    // Pricing — only populated on the kit-builder flow
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

// Conditional validation for the customization flow: requires a product
// and a customization type, and a logo if needsLogo is true. Kit-builder
// validation (budget/quantity/etc.) stays exactly where it was — in the
// controller — unchanged.
kitEnquirySchema.pre("validate", function (next) {
  if (this.requestType === "customization") {
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      return next(new Error("Please select a product to customize."));
    }
    if (!this.customizationType) {
      return next(new Error("Please specify the type of customization needed."));
    }
    if (this.needsLogo && !this.brandLogo) {
      return next(new Error("Logo is required when needsLogo is true."));
    }
  }
  next();
});

// prevents OverwriteModelError if imported more than once
export default mongoose.models.KitEnquiry || mongoose.model("KitEnquiry", kitEnquirySchema);