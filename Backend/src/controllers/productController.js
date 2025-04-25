import Product from "../models/products.js";
import Category from "../models/category.js";
import mongoose from "mongoose";
import express from "express";

const router = express.Router();

// Create a new product
export const createProduct = async (req, res) => {
  console.log("Received request to create product");
  console.log("Request Body:", req.body); // Log the incoming data

  try {
    const { name, description, price, stock, category, images } = req.body;
    if (!name || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      images,
    });
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .select("-__v")
      .lean();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (
      updates.category &&
      !mongoose.Types.ObjectId.isValid(updates.category)
    ) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    if (updates.category) {
      const existingCategory = await Category.findById(updates.category);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ category: categoryId })
      .populate("category", "name")
      .select("-__v")
      .lean();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching products by category",
        error: error.message,
      });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const keywords = query
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => new RegExp(word, "i")); // case-insensitive regex

    const results = await Product.find({
      $or: [
        { title: { $in: keywords } },
        { description: { $in: keywords } },
        { category: { $in: keywords } },
        { tags: { $in: keywords } }, // assuming tags is an array
      ],
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error in search:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
