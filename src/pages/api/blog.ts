import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import blog from "@/models/blog";
import { requireAdmin } from "@/lib/authMiddleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  switch (req.method) {
    case "GET":
      // Public — anyone can read blogs
      try {
        const blogs = await blog.find().sort({ date: -1 });
        return res.status(200).json({ success: true, data: blogs });
      } catch (error) {
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : String(error) 
        });
      }

    case "POST": {
      // Only admins can create blog posts
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      try {
        const { title, excerpt, content, image, date } = req.body;
        
        // Validate required fields
        if (!title || !excerpt || !content || !image) {
          return res.status(400).json({ 
            success: false, 
            message: "All fields are required" 
          });
        }

        const newBlog = await blog.create({
          title,
          excerpt,
          content,
          image,
          date: new Date(date),
          author: 'Admin'
        });

        return res.status(201).json({ success: true, data: newBlog });
      } catch (error) {
        console.error('Blog creation error:', error);
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : "Failed to create blog post"
        });
      }
    }

    case "DELETE": {
      // Only admins can delete blog posts
      const adminDel = await requireAdmin(req, res);
      if (!adminDel) return;

      try {
        const { id } = req.body;
        const deletedBlog = await blog.findByIdAndDelete(id);
        
        if (!deletedBlog) {
          return res.status(404).json({ success: false, message: "Blog not found" });
        }
        
        return res.status(200).json({ success: true, data: deletedBlog });
      } catch (error) {
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    default:
      return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}