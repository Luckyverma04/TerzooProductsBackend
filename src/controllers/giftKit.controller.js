import Product from "../models/product.model.js";
import KitEnquiry from "../models/KitEnquiry.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* =======================
   PRODUCT APIs (ADMIN)
======================= */

// Create Product
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
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    fs.unlinkSync(req.file.path);

    const product = await Product.create({
      name,
      description,
      category,
      unitPrice,
      brandingPrice,
      minOrderQty,
      customBrandingMOQ,
      brandingSupported,
      budgetTags: JSON.parse(budgetTags),
      images: [result.secure_url],
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
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

// Get Products by Budget
export const getProductsByBudget = async (req, res) => {
  try {
    const budget = Number(req.params.budget);

    const products = await Product.find({
      isActive: true,
      budgetTags: budget,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products by Category + Budget
export const getProductsByCategoryAndBudget = async (req, res) => {
  try {
    const { budget, category } = req.query;

    const products = await Product.find({
      isActive: true,
      category,
      budgetTags: Number(budget),
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Brand Logo
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

// Submit Final Kit Enquiry
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

// =======================
// AUTO KIT SUGGESTIONS
// =======================
export const getKitSuggestions = async (req, res) => {
  try {
    const budget = Number(req.query.budget);

    if (!budget) {
      return res.status(400).json({ message: "Budget is required" });
    }

    const diaries = await Product.find({
      category: "Diary",
      budgetTags: budget,
      isActive: true,
    }).limit(5);

    const pens = await Product.find({
      category: "Pen",
      budgetTags: budget,
      isActive: true,
    }).limit(4);

    const bottles = await Product.find({
      category: "Bottle",
      budgetTags: budget,
      isActive: true,
    }).limit(4);

    const keychains = await Product.find({
      category: "Keychain",
      budgetTags: budget,
      isActive: true,
    }).limit(3);

    const box = await Product.findOne({
      category: "Box",
      isActive: true,
    });

    res.json({
      success: true,
      budget,
      box,
      categories: {
        diaries,
        pens,
        bottles,
        keychains,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// PRICE PREVIEW API
// =======================
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

      // MOQ for custom branding (Keychain logic)
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
