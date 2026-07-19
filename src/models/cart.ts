// models/Cart.ts
import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);