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
    res.status(500).json({
      message: "Error fetching products by category",
      error: error.message,
    });
  }
};

// export const searchProducts = async (req, res) => {
//   try {
//     const query = req.query.q;

//     if (!query) {
//       return res.status(400).json({ message: "Search query is required" });
//     }

//     const keywords = query
//       .split(" ")
//       .filter((word) => word.trim() !== "")
//       .map((word) => new RegExp(word, "i")); // case-insensitive regex

//     const results = await Product.find({
//       $or: [
//         { title: { $in: keywords } },
//         { description: { $in: keywords } },
//         { category: { $in: keywords } },
//         { tags: { $in: keywords } }, // assuming tags is an array
//       ],
//     });

//     res.status(200).json(results);
//   } catch (error) {
//     console.error("❌ Error in search:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// import Product from '../models/Product.js';
// import Category from '../models/Category.js';

export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    // Parse the search query
    const { searchTerms, maxPrice, categoryNames } = await parseSearchQuery(
      query
    );

    // Find matching categories
    let categoryIds = [];
    if (categoryNames.length > 0) {
      const categories = await Category.find({
        name: { $in: categoryNames.map((n) => new RegExp(n, "i")) },
      });
      categoryIds = categories.map((c) => c._id);
    }

    // Build the filter
    const filter = {
      $and: [
        { $text: { $search: searchTerms } },
        ...(maxPrice ? [{ price: { $lte: maxPrice } }] : []),
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
      ],
    };

    const products = await Product.find(filter)
      .populate("category")
      .sort({ score: { $meta: "textScore" } });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to parse natural language queries
const parseSearchQuery = async (query) => {
  const result = {
    searchTerms: "",
    maxPrice: null,
    categoryNames: [],
  };

  // Extract price constraints
  const priceRegex = /(under|below|less than)\s+₹?(\d+)/i;
  const priceMatch = query.match(priceRegex);
  if (priceMatch) {
    result.maxPrice = parseInt(priceMatch[2]);
    query = query.replace(priceRegex, "");
  }

  // Extract category names (you might need to modify this based on your actual categories)
  const categoryRegex = /(ring|necklace|bracelet|earrings?|bangle|pendant)/gi;
  result.categoryNames = [...(new Set(query.match(categoryRegex)) || [])];
  query = query.replace(categoryRegex, "");

  // Remaining text becomes search terms
  result.searchTerms = query.trim();

  return result;
};

// In productController.js
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    const suggestions = Array.from(
      new Set(
        products.flatMap((p) => [
          p.name,
          `under ${Math.ceil(p.price / 1000) * 1000}`, // Price brackets
          p.category.name, // Assuming category is populated
        ])
      )
    ).slice(0, 5);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
