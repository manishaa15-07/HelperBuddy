// pages/api/serviceRequest/accept.ts
import connectDB from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import Service from "@/models/Service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      
      // Find and validate the service request
      const request = await ServiceRequest.findById(id);
      if (!request) return res.status(404).json({ success: false, error: "Request not found" });

      

      // Remove the original request
      await ServiceRequest.findByIdAndDelete(id);

      return res.status(200).json({ success: true, message: "Request declined and deleted" });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method Not Allowed" });
  }
}