
import Product from "../models/product.model.js";
import KitEnquiry from "../models/KitEnquiry.model.js";
/* ================================
   CREATE KIT ENQUIRY (USER FLOW)
================================ */

export const createKitEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      budget,
      quantity,
      selectedProducts,
      brandLogo,
    } = req.body;

    /* ================================
       BASIC VALIDATIONS
    ================================ */

    if (!budget || !quantity || !selectedProducts?.length) {
      return res.status(400).json({
        message: "Budget, quantity and product selection are required",
      });
    }

    if (quantity < 20) {
      return res.status(400).json({
        message: "Minimum order quantity is 20 units",
      });
    }

    /* ================================
       VALIDATE PRODUCTS & MOQ RULES
    ================================ */

    let perKitPrice = 0;

    for (const item of selectedProducts) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "One or more selected products not found",
        });
      }

      // 🔴 Custom branding MOQ rule (eg. keychain ≥ 100)
      if (
        product.customBrandingMOQ &&
        quantity < product.customBrandingMOQ
      ) {
        return res.status(400).json({
          message: `${product.name} requires minimum order of ${product.customBrandingMOQ}`,
        });
      }

      perKitPrice += product.unitPrice;
      if (product.brandingSupported) {
        perKitPrice += product.brandingPrice || 0;
      }
    }

    /* ================================
       TOTAL PRICE
    ================================ */

    const totalPrice = perKitPrice * quantity;

    /* ================================
       SAVE ENQUIRY
    ================================ */

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
    });

    /* ================================
       RESPONSE (USER FRIENDLY)
    ================================ */

    res.status(201).json({
      success: true,
      message: "Your gift kit enquiry has been submitted successfully",
      enquiryId: enquiry._id,
      pricing: {
        perKitPrice,
        totalPrice,
        note: "GST will be applicable separately",
      },
      contact: {
        phone: "+91-XXXXXXXXXX",
        email: "sales@trazooglobal.com",
      },
    });
  } catch (error) {
    console.error("Kit Enquiry Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ================================
   ADMIN: GET ALL KIT ENQUIRIES
================================ */

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

/* ================================
   ADMIN: UPDATE ENQUIRY STATUS
================================ */

export const updateKitEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const enquiry = await KitEnquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    enquiry.status = status;
    await enquiry.save();

    res.json({
      success: true,
      message: "Enquiry status updated",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
