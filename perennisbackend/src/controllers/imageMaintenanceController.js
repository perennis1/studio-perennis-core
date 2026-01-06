// src/controllers/imageMaintenanceController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this if your upload folder is elsewhere
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const UPLOAD_URL_PREFIX = "/uploads/";

// Helper: extract all <img src="..."> URLs from HTML
function extractImageSrcs(html) {
  if (!html) return [];
  const regex = /<img[^>]+src=["']([^"']+)["']/g;
  const srcs = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    srcs.push(match[1]);
  }
  return srcs;
}

// Core helper: compute which files are used/unused
async function computeImageUsage() {
  // 1) Get all physical files in /uploads
  let files = [];
  try {
    files = await fs.promises.readdir(UPLOAD_DIR);
  } catch (err) {
    // If uploads folder doesn't exist yet, just treat as empty
    if (err.code === "ENOENT") {
      return {
        files: [],
        used: [],
        unused: [],
      };
    }
    throw err;
  }

  const allFileUrls = files.map((name) => `${UPLOAD_URL_PREFIX}${name}`);

  // 2) Look through all post contents and gather used URLs
  const posts = await prisma.post.findMany({
    select: { content: true },
  });

  const usedSet = new Set();
  for (const post of posts) {
    const srcs = extractImageSrcs(post.content || "");
    for (const src of srcs) {
      usedSet.add(src);
    }
  }

  // 3) Classify files
  const used = [];
  const unused = [];

  for (const url of allFileUrls) {
    if (usedSet.has(url)) {
      used.push(url);
    } else {
      unused.push(url);
    }
  }

  return { files: allFileUrls, used, unused };
}

// GET /api/admin/images/unused → see which files are used/unused
export const listImageUsage = async (req, res, next) => {
  try {
    const { files, used, unused } = await computeImageUsage();

    res.json({
      totalFiles: files.length,
      usedCount: used.length,
      unusedCount: unused.length,
      used,
      unused,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/images/cleanup → delete unused files
export const cleanupUnusedImages = async (req, res, next) => {
  try {
    const { unused } = await computeImageUsage();

    let deleted = 0;
    for (const url of unused) {
      const fileName = url.split("/").pop();
      if (!fileName) continue;

      const filePath = path.join(UPLOAD_DIR, fileName);

      try {
        await fs.promises.unlink(filePath);
        deleted += 1;
      } catch (err) {
        // Ignore "file not found", log others
        if (err.code !== "ENOENT") {
          console.error("Failed to delete file", filePath, err);
        }
      }
    }

    res.json({
      message: "Cleanup complete",
      deleted,
    });
  } catch (err) {
    next(err);
  }
};
