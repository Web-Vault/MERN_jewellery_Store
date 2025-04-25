import mongoose from "mongoose";
import Collection from "../models/collection.js";
import Cart from "../models/cart.js"; // Cart Schema
import Wishlist from "../models/wishlist.js";
import { addToWishlist } from "./wishlistController.js";

// ✅ GET ALL COLLECTIONS
export const getCollections = async (req, res) => {
    try {
        const collections = await Collection.find();
        res.status(200).json(collections);
    } catch (error) {
        console.error("❌ Error fetching collections:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ FUNCTION TO FIND PRODUCT IN COLLECTIONS
const findProductInCollections = async (productId) => {
    console.log("🔍 Searching for product ID:", productId);

    try {
        const objectId = new mongoose.Types.ObjectId(productId);
        const collections = await Collection.find();

        for (const collection of collections) {
            console.log(`📂 Checking Collection: ${collection.collectionName}`);

            const foundProduct = collection.collectionProducts.find(
                p => p.productId.toString() === productId
            );

            if (foundProduct) {
                console.log("✅ Product found in collection:", collection.collectionName);
                return foundProduct;
            }
        }
        console.log("❌ Product NOT found in any collection!");
        return null;
    } catch (error) {
        console.error("❌ Error finding product in collections:", error);
        return null;
    }
};

// ✅ ADD PRODUCT TO CART
export const getProductFromCollectionsAndAddToCart = async (req, res) => {
    try {
        const userId = req.user._id; // ✅ Get logged-in user
        const { product } = req.body; // ✅ Receive full product object

        if (!product || !product._id) {
            return res.status(400).json({ success: false, message: "❌ Product data is missing!" });
        }

        console.log("✅ Received product for cart:", product);

        // ✅ Find user's cart or create a new one
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [] });
        }

        // ✅ Check if the product already exists in cart
        const existingProductIndex = cart.products.findIndex(
            (p) => p.productId.toString() === product._id
        );

        if (existingProductIndex !== -1) {
            // ✅ Product exists, increase quantity
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // ✅ Add new product with all details
            cart.products.push({
                productId: product._id, // ✅ Store product ID directly
                name: product.productName,
                price: product.productPrice,
                image: product.productImage,
                quantity: 1,
            });
        }

        await cart.save(); // ✅ Save updated cart

        console.log("✅ Updated cart:", cart);

        return res.json({ success: true, message: "✅ Product added to cart!", data: cart });

    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        return res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};

export const getProductFromCollectionsAndAddToWishList = async (req, res) => {
    try {
        const product = req.body;
        console.log("Id in request body", product.productId);
        console.log("✅ Received product for wishlist:", product.productId);

        const userId = req.user?.id;
        console.log("👤 User ID:", userId);

        if (!userId) {
            return res.status(400).json({ success: false, message: "❌ User ID is missing!" });
        }

        if (!product) {
            return res.status(400).json({ success: false, message: "❌ Product data is missing!" });
        }

        req.body.productModel = "Collection";
        // let wishlistItems = await Wishlist.findOne({ user: userId });
        // console.log("🛍️ Retrieved wishlist:", wishlistItems);

        // if (!wishlistItems) {
        //     // Corrected model name to 'Wishlist' (uppercase)
        //     wishlistItems = new Wishlist({
        //         user: userId,
        //         products: [product],
        //     });
        // } else {
        //     // Corrected variable name to 'wishlistItems'
        //     if (!wishlistItems.products) {
        //         console.log("🛑 products array was undefined. Initializing...");
        //         wishlistItems.products = [];
        //     }

        //     const productExists = wishlistItems.products.some(p => p._id.toString() === product._id.toString());
        //     if (!productExists) {
        //         wishlistItems.products.push(product);
        //     }
        // }

        // // Save the document instance, not the model
        // await wishlistItems.save();

        // return res.status(200).json({ success: true, message: "✅ Product added to wishlist!", data: wishlistItems });

        await addToWishlist(req, res);

    } catch (error) {
        console.error("❌ Wishlist Error:", error);
        return res.status(500).json({ success: false, message: "❌ Internal Server Error" });
    }
};
