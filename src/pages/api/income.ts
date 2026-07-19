import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import income from "@/models/income"; // Correct import

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDB();

    if (req.method === "POST") {
      const { name, earnings, productId, customerId, orders, avgOrderValue } = req.body;
      
      if (!name || earnings === undefined) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const newIncome = await income.create({
        name,
        earnings,
        productId,
        customerId,
        orders: orders || 1,
        avgOrderValue: avgOrderValue || earnings,
      });

      return res.status(201).json({ success: true, income: newIncome });
    }

    // Default to GET
    const incomes = await income.find(); 
    return res.status(200).json({ success: true, incomes }); 
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}