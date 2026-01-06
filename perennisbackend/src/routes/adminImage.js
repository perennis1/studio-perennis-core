// src/routes/adminImage.js
import express from "express";
import {
  listImageUsage,
  cleanupUnusedImages,
} from "../controllers/imageMaintenanceController.js";

const router = express.Router();

// See which images are used vs unused
router.get("/unused", listImageUsage);

// Delete unused images from disk
router.post("/cleanup", cleanupUnusedImages);

export default router;
