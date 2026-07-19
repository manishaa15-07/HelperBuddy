// pages/api/transactions.ts
import mongoose from 'mongoose';
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // All transaction operations require admin access
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    try {
      const transactions = await Transaction.find()
        .populate('userId', 'name email')
        .sort({ date: -1 });
      res.status(200).json({ success: true, transactions });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else if (req.method === "POST") {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { userId, amount, type, description } = req.body;
        
        // Create transaction
        const transaction = await Transaction.create([{
          userId,
          amount,
          type,
          description
        }], { session });

        // Update user's wallet balance
        const updateOperation = type === 'credit' 
          ? { $inc: { walletBalance: amount } }
          : { $inc: { walletBalance: -amount } };
          
        await User.findByIdAndUpdate(userId, updateOperation, { session });

        await session.commitTransaction();
        res.status(201).json({ success: true, transaction: transaction[0] });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
