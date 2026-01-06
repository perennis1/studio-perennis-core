import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

type DecodedToken = {
  id: number;
  email: string;
  role?: "ADMIN" | "USER";
};

export function verifyToken(req: NextRequest): DecodedToken {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = auth.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
}

export function verifyTokenOptional(req: NextRequest): DecodedToken | null {
  try {
    return verifyToken(req);
  } catch {
    return null;
  }
}
