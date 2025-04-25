import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: "text" },
    description: { type: String, index: "text" },
    price: { type: Number, required: true, index: true },
    stock: { type: Number, default: 1 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    images: [{ type: String }],
  },
  { timestamps: true }
);

// Compound index for better search performance
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
