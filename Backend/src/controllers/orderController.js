import Order from "../models/orders.js";
import Cart from "../models/cart.js";

export const storeOrderAfterPayment = async (req, res) => {
    try {
        console.log("🔹 Order Data Received:", JSON.stringify(req.body, null, 2));

        console.log("received info before storing orders: ", req.body);

        // Extract data
        const { items, totalAmount, paymentId, paymentStatus } = req.body;
        let user = req.user?._id;  // Extract from token

        console.log("🟢 Extracted User ID from Token:", user);

        // If `req.user` is missing, check if user ID was sent in body
        if (!user && req.body.user) {
            console.warn("⚠️ User not found in token! Using provided user ID:", req.body.user);
            user = req.body.user;
        }

        // Ensure user and required fields exist
        if (!user || !items || items.length === 0 || !totalAmount || !paymentId || !paymentStatus) {
            console.error("❌ Missing Required Fields:", { user, items, totalAmount, paymentId, paymentStatus });
            return res.status(400).json({ message: "❌ Missing required order details" });
        }

        console.log("🟢 Creating Order in Database...");

        // ✅ Create and save order
        const order = new Order({
            user,
            items,
            totalAmount,
            paymentId,
            paymentStatus,
            orderStatus: paymentStatus === "Paid" ? "Confirmed" : "Pending",
        });

        await order.save();
        console.log("✅ Order Stored Successfully:", order);

        await Cart.deleteMany({ user });

        return res.status(201).json({ message: "✅ Order stored successfully! cart cleared", order });

    } catch (error) {
        console.error("❌ Error Storing Order:", error);
        return res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
    }
};



// ✅ Get all orders for an admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate("userId", "name email"); // Adjust population as needed

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Get orders for a specific user
export const getUserOrders = async (req, res) => {
    try {
        console.log("🔹 Fetching orders for user:", req.user._id);
        const orders = await Order.find({ user: req.user._id }).populate("items.product", "name price");

        console.log("✅ User orders fetched successfully: ", orders.items);
        res.status(200).json(orders);
    } catch (error) {
        console.error("❌ Error fetching user orders:", error);
        res.status(500).json({ message: "Error fetching user orders", error: error.message });
    }
};
