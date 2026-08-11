import Product from "../models/product.model.js";
import KitEnquiry from "../models/KitEnquiry.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* =======================
   CONSTANTS - UPDATED TO MATCH FRONTEND
======================= */
const ALLOWED_CATEGORIES = [
  "Apparel",
  "Drinkware",
  "Stationery",
  "Bags",
  "Electronics & Tech",
  "Travel",
  "Wellness",
  "Food & Hampers",
  "Awards & Recognition",
  "Event Merchandise",
  "Packaging",
];

/* =======================
   PRODUCT APIs (ADMIN)
======================= */

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unitPrice,
      brandingPrice,
      minOrderQty,
      customBrandingMOQ,
      brandingSupported,
      budgetTags,
      spec,           // ✅ NEW - OPTIONAL
      useCases,       // ✅ NEW - OPTIONAL
    } = req.body;

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
      });
    }

    const existing = await Product.findOne({
      name: name.trim(),
      category,
    });

    if (existing) {
      return res.status(400).json({
        message: "Product already exists in this category",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    fs.unlinkSync(req.file.path);

    const product = await Product.create({
      name: name.trim(),
      description,
      category,
      unitPrice,
      brandingPrice,
      minOrderQty,
      customBrandingMOQ,
      brandingSupported,
      budgetTags: budgetTags ? JSON.parse(budgetTags).map(Number) : [],
      images: [result.secure_url],
      spec: spec || null,                    // ✅ OPTIONAL
      useCases: useCases ? JSON.parse(useCases) : [],  // ✅ OPTIONAL
      isActive: true,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Products (Admin - Shows both active and inactive)
export const getAllProducts = async (req, res) => {
  try {
    // ✅ FIXED: Removed isActive filter so admin can see ALL products
    const products = await Product.find({}).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Active Products Only (Frontend - for product page)
export const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   USER TOOL APIs
======================= */

// ✅ Get Products by Budget
export const getProductsByBudget = async (req, res) => {
  try {
    const budget = Number(req.params.budget);

    const products = await Product.find({
      isActive: true,
      budgetTags: { $in: [budget] },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Products by Category + Budget
export const getProductsByCategoryAndBudget = async (req, res) => {
  try {
    const { budget, category } = req.query;

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const products = await Product.find({
      isActive: true,
      category,
      budgetTags: { $in: [Number(budget)] },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Upload Brand Logo
export const uploadBrandLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Logo file required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "brand-logos",
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      logoUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Toggle Product Status (Active/Inactive)
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isActive = !product.isActive;
    await product.save();

    res.json({ success: true, isActive: product.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Submit Final Kit Enquiry
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
      perKitPrice,
      totalPrice,
    } = req.body;

    if (quantity < 20) {
      return res
        .status(400)
        .json({ message: "Minimum order quantity is 20" });
    }

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
    });

    res.status(201).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =======================
   AUTO KIT SUGGESTIONS
======================= */

export const getKitSuggestions = async (req, res) => {
  try {
    const budget = Number(req.query.budget);

    if (!budget || budget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid budget is required",
      });
    }

    // 1️⃣ Fetch ONLY products under budget (user requirement)
    const products = await Product.find({
      isActive: true,
      category: { $ne: "Packaging" },
      unitPrice: { $lte: budget },
    }).sort({ unitPrice: 1 });

    // 2️⃣ Fetch packaging box (auto included)
    const box = await Product.findOne({
      category: "Packaging",
      isActive: true,
    });

    // 3️⃣ Correct category grouping
    const categories = {
      apparel: [],
      stationery: [],
      drinkware: [],
      bags: [],
      electronics: [],
      travel: [],
      wellness: [],
      food: [],
      awards: [],
      merchandise: [],
    };

    products.forEach((product) => {
      switch (product.category) {
        case "Apparel":
          categories.apparel.push(product);
          break;
        case "Stationery":
          categories.stationery.push(product);
          break;
        case "Drinkware":
          categories.drinkware.push(product);
          break;
        case "Bags":
          categories.bags.push(product);
          break;
        case "Electronics & Tech":
          categories.electronics.push(product);
          break;
        case "Travel":
          categories.travel.push(product);
          break;
        case "Wellness":
          categories.wellness.push(product);
          break;
        case "Food & Hampers":
          categories.food.push(product);
          break;
        case "Awards & Recognition":
          categories.awards.push(product);
          break;
        case "Event Merchandise":
          categories.merchandise.push(product);
          break;
        default:
          break;
      }
    });

    res.status(200).json({
      success: true,
      budget,
      box,
      categories,
      note: "Products shown are within selected budget",
    });
  } catch (error) {
    console.error("Kit Suggestion Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load kit suggestions",
    });
  }
};

/* =======================
   PRICE PREVIEW API
======================= */

export const calculateKitPrice = async (req, res) => {
  try {
    const { quantity, selectedProducts } = req.body;

    if (!quantity || quantity < 20) {
      return res
        .status(400)
        .json({ message: "Minimum order quantity is 20" });
    }

    let perKitPrice = 0;
    const pricingBreakup = [];

    for (const item of selectedProducts) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: "Selected product not found" });
      }

      if (
        item.brandingType === "logo" &&
        product.customBrandingMOQ &&
        quantity < product.customBrandingMOQ
      ) {
        return res.status(400).json({
          message: `${product.name} requires minimum order of ${product.customBrandingMOQ}`,
        });
      }

      let itemPrice = product.unitPrice;

      if (item.brandingType === "logo" && product.brandingSupported) {
        itemPrice += product.brandingPrice || 0;
      }

      perKitPrice += itemPrice;

      pricingBreakup.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        price: itemPrice,
      });
    }

    const totalPrice = perKitPrice * quantity;

    res.json({
      success: true,
      perKitPrice,
      totalPrice,
      pricingBreakup,
      note: "GST will be applicable separately",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};