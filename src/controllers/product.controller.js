import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createProduct = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    // 🔥 Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // 🔥 Delete local temp file
    fs.unlinkSync(req.file.path);

    const product = await Product.create({
      name,
      description,
      image: result.secure_url,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
