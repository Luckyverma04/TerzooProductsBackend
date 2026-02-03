import KitEnquiry from "../models/KitEnquiry.model.js";
import Product from "../models/product.model.js";

/* ================================================
   CREATE KIT ENQUIRY  —  POST /kit-enquiry
================================================ */
export const createKitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, budget, quantity, selectedProducts, brandLogo } = req.body;

    if (!budget || !quantity || !selectedProducts?.length) {
      return res.status(400).json({ message: "Budget, quantity and product selection are required" });
    }
    if (quantity < 20) {
      return res.status(400).json({ message: "Minimum order quantity is 20 units" });
    }

    let perKitPrice = 0;

    for (const item of selectedProducts) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: "One or more selected products not found" });
      }
      if (product.customBrandingMOQ && quantity < product.customBrandingMOQ) {
        return res.status(400).json({
          message: `${product.name} requires minimum order of ${product.customBrandingMOQ}`,
        });
      }
      perKitPrice += product.unitPrice;
      if (product.brandingSupported) {
        perKitPrice += product.brandingPrice || 0;
      }
    }

    const totalPrice = perKitPrice * quantity;

    const enquiry = await KitEnquiry.create({
      name,
      email,
      phone,
      budget,
      quantity,
      selectedProducts,
      brandLogo,
      perKitPrice,
      totalPrice,
      gstApplicable: true,
      status: "new",
      history: [{ action: "Enquiry created", comment: "Submitted via kit builder" }],
    });

    res.status(201).json({
      success: true,
      message: "Your gift kit enquiry has been submitted successfully",
      enquiryId: enquiry._id,
      pricing: {
        perKitPrice,
        totalPrice,
        note: "GST will be applicable separately",
      },
    });
  } catch (error) {
    console.error("Kit Enquiry Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================================================
   GET ALL KIT ENQUIRIES  —  GET /kit-enquiry
================================================ */
export const getAllKitEnquiries = async (req, res) => {
  try {
    const enquiries = await KitEnquiry.find()
      .populate("selectedProducts.productId")
      .sort({ createdAt: -1 });

    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================================
   GET SINGLE KIT ENQUIRY  —  GET /kit-enquiry/:id
================================================ */
export const getKitEnquiryById = async (req, res) => {
  try {
    const enquiry = await KitEnquiry.findById(req.params.id)
      .populate("selectedProducts.productId");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================================
   UPDATE STATUS  —  PATCH /kit-enquiry/:id/status

   This is the single status route. Every button
   across the whole app hits this endpoint.

   Buttons and what they send:
   ─────────────────────────────────────────────
   KitEnquiries page (lowercase):
     Mark as Contacted   →  { status: "contacted" }
     Mark as Completed   →  { status: "completed" }
     Cancel Enquiry      →  { status: "cancelled" }

   AdminLeadDetails page (UPPERCASE):
     Contact via Email   →  { status: "ACTIVE" }
     Mark as Contacted   →  { status: "CONFIRMED" }
     Mark as Completed   →  { status: "COMPLETED" }
     Cancel Enquiry      →  { status: "CANCELLED" }
   ─────────────────────────────────────────────
   The allowedStatuses list below MUST contain
   every single one of these. If it's missing
   even one, that button returns 400.
================================================ */
export const updateKitEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    /* ── 1. status field must exist ── */
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    /* ── 2. validate against the full list ──
           This is where the bug was.
           "completed" and "cancelled" (lowercase)
           were missing, so those buttons always got 400. */
    const allowedStatuses = [
      // legacy
      "new", "contacted", "quoted", "won", "lost",
      // KitEnquiries page (lowercase)
      "pending", "completed", "cancelled",
      // AdminLeadDetails page (UPPERCASE)
      "PENDING", "ACTIVE", "CONFIRMED", "COMPLETED", "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status: ${status}` });
    }

    /* ── 3. find the document ── */
    const enquiry = await KitEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    /* ── 4. record old → new, set, push history, save ── */
    const oldStatus = enquiry.status;
    enquiry.status = status;

    enquiry.history.push({
      action: `Status changed: ${oldStatus} → ${status}`,
      comment: "",
    });

    await enquiry.save();

    res.json({
      success: true,
      message: `Enquiry status updated to ${status}`,
      enquiry,
    });
  } catch (error) {
    console.error("updateKitEnquiryStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};