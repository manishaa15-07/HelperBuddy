import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, requireAdmin } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    // Only admins can list ALL bookings
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const bookings = await Booking.find().populate("userId serviceId");
      res.status(200).json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    // Authenticated users can create bookings
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const booking = await Booking.create({
        ...req.body,
        userId: user.id, // Use authenticated user's ID, not from request body
      });
      res.status(201).json({ success: true, booking });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
