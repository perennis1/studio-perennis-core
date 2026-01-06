// perennisbackend/src/routes/bookRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import prisma from "../lib/prisma.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getRazorpay } from "../lib/razorpayClient.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/*                               FILE UPLOAD                                  */
/* -------------------------------------------------------------------------- */

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "cover") {
        cb(null, path.join(__dirname, "..", "..", "public", "books", "covers"));
      } else {
        cb(null, path.join(__dirname, "..", "..", "private", "books"));
      }
    },
    filename: (req, file, cb) => {
      cb(null, `temp-${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
});

/* -------------------------------------------------------------------------- */
/*                               PUBLIC LIST                                  */
/* -------------------------------------------------------------------------- */

router.get("/list", async (_req, res) => {
  const books = await prisma.book.findMany({
    include: {
      variants: { select: { id: true, type: true, pricePaise: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ books });
});

/* -------------------------------------------------------------------------- */
/*                               SERVE PDF                                    */
/* -------------------------------------------------------------------------- */

router.get("/:bookId/pdf", verifyToken, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const userId = req.user.id;

  const allowed = await prisma.libraryEntry.findFirst({
    where: { userId, bookId, format: "PDF" },
  });

  if (!allowed) return res.sendStatus(403);

  const pdfPath = path.join(
    __dirname,
    "..",
    "..",
    "private",
    "books",
    `${bookId}.pdf`
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  fs.createReadStream(pdfPath).pipe(res);
});

/* -------------------------------------------------------------------------- */
/*                               ADMIN CREATE                                 */
/* -------------------------------------------------------------------------- */

router.post(
  "/",
  verifyToken,
  upload.fields([{ name: "pdf" }, { name: "cover" }]),
  async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isAdmin) return res.sendStatus(403);

    const parsedVariants = JSON.parse(req.body.variants);

    const book = await prisma.book.create({
      data: { title: req.body.title, slug: req.body.title.toLowerCase() },
    });

    await fs.promises.mkdir(
      path.join(__dirname, "..", "..", "private", "books"),
      { recursive: true }
    );

    await fs.promises.rename(
      req.files.pdf[0].path,
      path.join(__dirname, "..", "..", "private", "books", `${book.id}.pdf`)
    );

    res.status(201).json({ bookId: book.id });
  }
);

/* -------------------------------------------------------------------------- */
/*                           BOOK PDF CHECKOUT                                 */
/* -------------------------------------------------------------------------- */

router.post("/:bookId/checkout", verifyToken, async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return res.status(503).json({
      error: "Payments are disabled in this environment",
    });
  }

  const bookId = Number(req.params.bookId);
  const userId = req.user.id;

  const pdfVariant = await prisma.bookVariant.findFirst({
    where: { bookId, type: "PDF" },
  });

  if (!pdfVariant) return res.sendStatus(404);

  const order = await prisma.bookOrder.create({
    data: {
      userId,
      totalAmountPaise: pdfVariant.pricePaise,
      paymentStatus: "PENDING",
    },
  });

  const rpOrder = await razorpay.orders.create({
    amount: pdfVariant.pricePaise,
    currency: "INR",
    receipt: `book_${bookId}_${Date.now()}`,
  });

  await prisma.bookOrder.update({
    where: { id: order.id },
    data: { razorpayOrderId: rpOrder.id },
  });

  res.json({ razorpayOrderId: rpOrder.id });
});

export default router;
