// pages/api/cart.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { requireAuth } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // All cart operations require authentication
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    try {
      const { productId, name, imageUrl, price, description, category, available } = req.body;

      // Validate required fields
      if (!productId || !name || !imageUrl || !price || !description || !category) {
        return res.status(400).json({ success: false, error: "Missing required fields" });
      }

      // Check if the product already exists in the user's cart
      const existingCartItem = await Cart.findOne({ productId, userId: user.id });

      if (existingCartItem) {
        await existingCartItem.save();
        return res.status(200).json({ success: true, data: existingCartItem });
      } else {
        const cartItem = await Cart.create({
          userId: user.id,
          productId,
          name,
          imageUrl,
          price,
          description,
          category,
          available: available || true,
        });
        return res.status(201).json({ success: true, data: cartItem });
      }
    } catch (error) {
      console.error("Error adding service to cart:", error);
      return res.status(400).json({ success: false, error: 'Failed to add to cart' });
    }
  }
  else if (req.method === 'GET') {
    try {
      const cartItems = await Cart.find({ userId: user.id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: cartItems });
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(400).json({ success: false, error: 'Failed to fetch cart items' });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      // Ensure the cart item belongs to the user before deleting
      const cartItem = await Cart.findOneAndDelete({ _id: id, userId: user.id });
      if (!cartItem) {
         return res.status(404).json({ success: false, error: 'Item not found in cart' });
      }
      return res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Failed to remove item from cart' });
    }
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
