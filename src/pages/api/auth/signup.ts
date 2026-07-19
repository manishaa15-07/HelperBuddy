import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/authMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      wallet: 0,
      referralCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT token for auto-login after signup
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    });

    // Remove password from response
    const userResponse = {
      ...user.toObject(),
      password: undefined
    };

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: (error as Error).message
    });
  }
}