import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "@/lib/mongodb"
import Comment from "@/models/comment"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB()

  switch (req.method) {
    case "GET":
      return handleGet(req, res)
    case "POST":
      return handleLike(req, res)
    case "DELETE":
      return handleDelete(req, res)
    default:
      return res.status(405).json({ success: false, message: "Method not allowed" })
  }
}

// GET: Fetch all comments
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const comments = await Comment.find()
    return res.status(200).json({ success: true, comments })
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// POST: Like a comment
async function handleLike(req: NextApiRequest, res: NextApiResponse) {
  const { commentId } = req.body

  if (!commentId) {
    return res.status(400).json({ success: false, error: "Comment ID is required" })
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likes: 1 } }, // Increment likes by 1
      { new: true }
    )

    if (!updatedComment) {
      return res.status(404).json({ success: false, error: "Comment not found" })
    }

    return res.status(200).json({ success: true, comment: updatedComment })
  } catch (error) {
    console.error("Error:", error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// DELETE: Delete a comment
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ success: false, error: "Comment ID is required" });
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ success: false, error: "Comment not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}