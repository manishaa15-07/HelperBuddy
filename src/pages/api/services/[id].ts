import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb"; // Ensure you have a utility to connect to MongoDB
import Service from "../../../models/Service"; // Import your Mongoose model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB(); // Ensure database connection

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { id } = req.query; // Get ID from URL parameters

    if (!id || typeof id !== "string") {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        const product = await Service.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Database fetch error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}