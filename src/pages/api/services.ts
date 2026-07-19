import connectDB from "@/lib/mongodb";
import Service from "@/models/Service";
import { NextApiRequest, NextApiResponse } from "next";
import { requireProvider } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    // Public — anyone can browse services
    try {
      const services = await Service.find();
      res.status(200).json({ success: true, services });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(500).json({ success: false, error: errorMessage });
    }
  } else if (req.method === "POST") {
    // Only providers or admins can create services
    const provider = await requireProvider(req, res);
    if (!provider) return;

    try {
      const service = await Service.create({
        ...req.body,
        providerId: provider.id, // Use authenticated provider's ID
      });
      res.status(201).json({ success: true, service });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as any).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
