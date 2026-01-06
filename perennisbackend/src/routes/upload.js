//perennisbackend\src\routes\upload.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Make sure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-image" + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// POST /api/upload/image
router.post("/image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Relative path – Next will proxy /uploads/... to the backend
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: imageUrl });
});


export default router;
