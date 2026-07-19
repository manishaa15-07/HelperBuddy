// pages/api/[id].ts — Single service CRUD
import connectDB from "@/lib/mongodb";
import Service from "@/models/Service";
import { NextApiRequest, NextApiResponse } from "next";
import { requireProvider } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case "GET":
      // Public — anyone can view a service
      if (id) {
        try {
          const service = await Service.findById(id);
          if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
          }
          res.status(200).json({ success: true, service });
        } catch (error) {
          res.status(400).json({ success: false, error: (error as Error).message });
        }
      } else {
        try {
          const services = await Service.find();
          res.status(200).json({ success: true, services });
        } catch (error) {
          res.status(400).json({ success: false, error: (error as Error).message });
        }
      }
      break;

    case "PUT": {
      // Only providers or admins can update services
      const providerPut = await requireProvider(req, res);
      if (!providerPut) return;

      try {
        const service = await Service.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!service) {
          return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
      } catch (error) {
        res.status(400).json({ success: false, error: (error as Error).message });
      }
      break;
    }

    case "DELETE": {
      // Only providers or admins can delete services
      const providerDel = await requireProvider(req, res);
      if (!providerDel) return;

      try {
        console.log('Attempting to delete service with ID:', id);
        
        const deletedService = await Service.findByIdAndDelete(id);
        
        if (!deletedService) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: "Service deleted successfully" 
        });
        
      } catch (error) {
          console.error('Delete error:', error);
          return res.status(500).json({ 
              success: false, 
              message: "Error deleting service",
              error: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    }
      break;

    default:
      res.status(405).json({ success: false, message: "Method not allowed" });
      break;
  }
}