import express from "express";
import prisma from "../lib/prisma.js";
import { verifyTokenOptional } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/books/storefront
 * Public endpoint.
 * If Authorization header exists, ownership is injected.
 */
router.get("/storefront", verifyTokenOptional, async (req, res) => {
  try {
    const userId = req.user?.id ?? null;

    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          include: {
            inventory: true,
          },
        },
        libraryEntries: userId
          ? { where: { userId, format: "PDF" } }
          : false,
      },
    });

    const response = books.map((book) => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      description: book.description,
      pages: book.pages,
      coverImage: book.coverImage,

      variants: book.variants.map((v) => {
        const inStock =
          v.type === "PDF"
            ? true
            : v.inventory.some((i) => i.onHand - i.reserved > 0);

        const owned =
          v.type === "PDF"
            ? book.libraryEntries?.length > 0
            : false; // hardcopy ownership later via orders

        return {
          id: v.id,
          type: v.type, // PDF | HARDCOPY
          pricePaise: v.pricePaise,
          currency: v.currency,
          inStock,
          owned,
        };
      }),
    }));

    res.json({ books: response });
  } catch (err) {
    console.error("Storefront error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
