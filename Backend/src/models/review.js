import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    },
    {
        timestamps: true
    });

export default mongoose.model("Review", reviewSchema);
