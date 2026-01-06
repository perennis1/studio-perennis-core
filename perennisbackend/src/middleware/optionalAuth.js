//C:\Users\studi\my-next-app\perennisbackend\src\middleware\optionalAuth.js



import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export async function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true },
    });

    if (user) req.user = user;
  } catch {
    // silently ignore
  }

  next();
}
