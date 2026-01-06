//C:\Users\studi\my-next-app\perennisbackend\src\routes\storefrontRoutes.js




import express from "express";
import prisma from "../lib/prisma.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

/**
 * GET /api/storefront/books
 * Public
 * If Authorization header present → includes owned flags
 */
router.get("/books", optionalAuth, async (req, res) => {
  const userId = req.user?.id ?? null;

  try {
    const books = await prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    let ownedPdfVariantIds = new Set();

    if (userId) {
      const owned = await prisma.libraryEntry.findMany({
        where: {
          userId,
          format: "PDF",
        },
        select: { bookId: true },
      });

      ownedPdfVariantIds = new Set(owned.map(o => o.bookId));
    }

    const payload = books.map(book => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      description: book.description,
      coverImage: book.coverImage,
      pages: book.pages,

      variants: book.variants.map(v => {
        const inventory = v.inventory[0]; // single warehouse for now

        const onHand = inventory?.onHand ?? 0;
        const reserved = inventory?.reserved ?? 0;
        const available = Math.max(onHand - reserved, 0);

        return {
          id: v.id,
          type: v.type, // PDF | HARDCOPY
          pricePaise: v.pricePaise,

          owned:
            v.type === "PDF"
              ? ownedPdfVariantIds.has(book.id)
              : false,

          inStock:
            v.type === "HARDCOPY"
              ? available > 0
              : true,

          availableQty:
            v.type === "HARDCOPY"
              ? available
              : null,
        };
      }),
    }));

    return res.json({ books: payload });
  } catch (err) {
    console.error("Storefront API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
