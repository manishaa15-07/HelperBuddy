import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    // Only admins can list all users
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const users = await User.find().select("-password"); // Exclude passwords
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    // Only admins can directly create users (normal users go through /api/auth/signup)
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const user = await User.create(req.body);
      res.status(201).json({ success: true, user });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
