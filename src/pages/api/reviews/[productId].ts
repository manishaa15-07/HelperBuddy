import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Review from "../../../models/review";
import connectDB from "../../../lib/mongodb";
import { requireAuth } from "../../../lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    const { productId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId as string)) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    try {
        if (req.method === "GET") {
            const reviews = await Review.find({ productId }).populate("userId", "name");
            return res.status(200).json(reviews);
        } else if (req.method === "POST") {
            const user = await requireAuth(req, res);
            if (!user) return; // Response sent by middleware

            const { rating, comment } = req.body;
            
            if (!rating || !comment) {
                return res.status(400).json({ error: "Rating and comment are required" });
            }

            const newReview = await Review.create({
                productId,
                userId: user.id,
                rating,
                comment
            });

            return res.status(201).json(newReview);
        } else {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("Error handling reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}