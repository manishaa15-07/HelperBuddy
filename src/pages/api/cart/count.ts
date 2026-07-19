import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from "@/lib/mongodb";
import Cart from "@/models/cart";
import { requireAuth } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authenticate user
    const user = await requireAuth(req, res);
    if (!user) return; // Response is already sent by requireAuth

    // Count items in the user's cart
    const count = await Cart.countDocuments({ userId: user.id });

    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return res.status(500).json({ success: false, error: 'Failed to fetch cart count' });
  }
}
