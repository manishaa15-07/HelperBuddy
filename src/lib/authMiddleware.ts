/**
 * JWT Authentication Middleware for Next.js API Routes
 *
 * Usage in any API route:
 *
 *   import { requireAuth, requireAdmin, requireProvider } from "@/lib/authMiddleware";
 *
 *   export default async function handler(req, res) {
 *     // Returns the decoded user payload or sends a 401/403 and returns null
 *     const user = await requireAuth(req, res);
 *     if (!user) return; // response already sent
 *
 *     // user is now { id, email, role }
 *   }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "helperbuddy_default_secret_change_me";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin" | "provider";
}

// Extend NextApiRequest to carry the authenticated user
export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthUser;
}

/**
 * Verify JWT token from the Authorization header.
 * Returns the decoded user payload or null (and sends error response).
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
    });
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Token is missing.",
    });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
    return null;
  }
}

/**
 * Verify JWT AND check that the user has the "admin" role.
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
    return null;
  }

  return user;
}

/**
 * Verify JWT AND check that the user has the "provider" role (or admin).
 */
export async function requireProvider(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (user.role !== "provider" && user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Service provider privileges required.",
    });
    return null;
  }

  return user;
}

/**
 * Generate a JWT token for a user.
 * Used by login/signup routes to issue tokens.
 */
export function generateToken(user: {
  id: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
