import express from "express";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/admin/inventory
 * Admin-only inventory overview
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin only" });
    }

    const inventory = await prisma.inventory.findMany({
      include: {
        warehouse: true,
        variant: {
          include: {
            book: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: {
        warehouseId: "asc",
      },
    });

    const result = inventory.map((row) => ({
      warehouse: row.warehouse.name,
      city: row.warehouse.city,
      book: row.variant.book.title,
      variantType: row.variant.type,
      sku: row.variant.sku,
      onHand: row.onHand,
      reserved: row.reserved,
      available: row.onHand - row.reserved,
    }));

    res.json({ inventory: result });
  } catch (err) {
    console.error("Admin inventory error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
