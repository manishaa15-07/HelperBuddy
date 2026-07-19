import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Provider from "@/models/provider";
import { hash } from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const { user_id } = req.query;
      if (!user_id || typeof user_id !== "string") {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const provider = await Provider.findOne({ "user_info.user_id": user_id });

      if (!provider) {
        return res.status(404).json({ success: false, message: "Provider not found" });
      }

      return res.status(200).json({ success: true, provider });
    } catch (error) {
      console.error("Error fetching provider:", error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  } 
  else  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    const {
      businessName,
      email,
      phone,
      password,
      categories,
      otp, // OTP verification should be handled before this
      user_id, // This should be generated after successful authentication
    } = req.body;

    // Basic validation
    if (!businessName || !email || !phone || !password || !categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if provider already exists with this email
    const existingProvider = await Provider.findOne({ "contact.email": email });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: "A provider with this email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create new provider
    const provider = new Provider({
      name: businessName,
      category: categories[0], // Primary category
      owner_name: businessName, // Can be updated later
      contact: {
        phone,
        email,
      },
      location: {
        address: "", // These can be filled out later
        city: "",
        state: "",
        zip_code: "",
      },
      bank_info: {
        bank_name: "", // These can be filled out later
        account_number: "",
        swift_code: "",
        branch_name: "",
        branch_address: "",
        identifier_code: "",
        code_number: "",
      },
      user_info: {
        user_id: user_id || Date.now().toString(), // Temporary ID if not provided
        username: email.split("@")[0], // Default username
        email,
        password: hashedPassword,
      },
    });

    await provider.save();

    return res.status(201).json({
      success: true,
      message: "Provider account created successfully",
      provider: {
        id: provider._id,
        businessName: provider.name,
        email: provider.contact.email,
      },
    });
  } catch (error) {
    console.error("Error in provider signup:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}