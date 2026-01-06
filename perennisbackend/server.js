import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import prisma from "./src/lib/prisma.js";

import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/user.js";
import blogRoutes from "./src/routes/blog.js";
import uploadRoutes from "./src/routes/upload.js";
import adminImageRoutes from "./src/routes/adminImage.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
import checkoutRoutes from "./src/routes/checkoutRoutes.js";
import razorpayWebhook from "./src/routes/razorpayWebhook.js";
import storefrontRoutes from "./src/routes/storefrontRoutes.js";
import adminInventoryRoutes from "./src/routes/adminInventoryRoutes.js";
import adminLedgerRoutes from "./src/routes/adminLedgerRoutes.js";
import adminLedgerVerifyRoutes from "./src/routes/adminLedgerVerifyRoutes.js";
import adminRefundRoutes from "./src/routes/adminRefundRoutes.js";
import activityRoutes from "./src/routes/me/activityRoutes.js";


import readingMetricsRoutes from "./src/routes/me/readingMetricsRoutes.js";
import pageAccessRoutes from "./src/routes/reading/pageAccessRoutes.js";
import reflectionRoutes from "./src/routes/reading/reflectionRoutes.js";
import gateAssignmentRoutes from "./src/routes/admin/gateAssignmentRoutes.js";
import curriculumRoutes from "./src/routes/admin/curriculumRoutes.js";
import cohortRoutes from "./src/routes/admin/cohortRoutes.js";
import readingWindowRoutes from "./src/routes/admin/readingWindowRoutes.js";
import curriculumAnalyticsRoutes from "./src/routes/admin/curriculumAnalyticsRoutes.js";
import privateReadingAnalyticsRoutes from "./src/routes/me/privateReadingAnalyticsRoutes.js";
import userActivityStreamRoutes from "./src/routes/me/activityStreamRoutes.js";
import adminActivityStreamRoutes from "./src/routes/admin/activityStreamRoutes.js";
import inquiryRoutes from "./src/routes/me/inquiryRoutes.js";
import inquiryReviewRoutes from "./src/routes/admin/inquiryReviewRoutes.js";
import reflectionInsightsRoutes from "./src/routes/admin/reflectionInsightsRoutes.js";
import gateSuggestionsRoutes from "./src/routes/admin/gateSuggestionsRoutes.js";
import adminDashboardRoutes from "./src/routes/admin/dashboardRoutes.js";
import adminOverviewRoutes from "./src/routes/admin/overviewRoutes.js";
import readingLiveRoutes from "./src/routes/admin/readingLiveRoutes.js";
import readingAccessRoutes from "./src/routes/readingAccess.js";
import adminReflectionRoutes from "./src/routes/admin/reflections.js";
import bookStorefront from "./src/routes/bookStorefront.js";
import refundRoutes from "./src/routes/admin/refundRoutes.js";
import courseAdminRoutes from "./src/routes/admin/courseAdminRoutes.js";

import errorHandler from "./src/middleware/errorHandler.js";
import { authLimiter, adminLimiter } from "./src/middleware/rateLimits.js";
import { releaseStaleOrders } from "./src/jobs/releaseStaleOrders.js";
import lessonReflectionRoutes from "./src/routes/reflectionRoutes.js";
import lessonTimelineRoutes from "./src/routes/lessonTimelineRoutes.js";
import lessonProgressRoutes from "./src/routes/lessonProgressRoutes.js";

import lessonProgressReadRoutes from "./src/routes/lessonProgressReadRoutes.js";
import lessonReflectionReadRoutes from "./src/routes/lessonReflectionReadRoutes.js";
import adminIntelligenceRoutes from "./src/routes/admin/intelligenceRoutes.js";
import curriculumIntelligenceRoutes from "./src/routes/admin/curriculumIntelligenceRoutes.js";

import { intelligenceLimiter } from "./src/middleware/intelligenceLimiter.js";


import adminActivityRoutes from "./src/routes/admin/activityRoutes.js";






const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* -------------------- CORS -------------------- */

const whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (whitelist.some((u) => origin.startsWith(u))) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* -------------------- CORE MIDDLEWARE -------------------- */

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------- RATE LIMITS -------------------- */

app.use("/api/auth", authLimiter);
app.use("/api/admin", adminLimiter);
app.use(
  "/api/admin/intelligence",
  intelligenceLimiter
);


/* -------------------- PUBLIC / USER -------------------- */

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/books", bookStorefront);
app.use("/api/books", bookRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/storefront", storefrontRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use("/api/reading", readingAccessRoutes);
app.use("/api/me/activity", activityRoutes);

app.use("/api/me", readingMetricsRoutes);
app.use("/api/me", inquiryRoutes);
app.use("/api/me", userActivityStreamRoutes);
app.use("/api/me", privateReadingAnalyticsRoutes);
app.use("/api", lessonTimelineRoutes);
app.use("/api", lessonProgressReadRoutes);
app.use("/api", lessonProgressRoutes);
app.use("/api", lessonReflectionReadRoutes);
/* -------------------- ADMIN (LOCKED ZONE) -------------------- */

app.use("/api/admin/overview", adminOverviewRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin", courseAdminRoutes);
console.log(
  "ADMIN ROUTES:",
  courseAdminRoutes.stack.map(r => r.route?.path).filter(Boolean)
);
app.use("/api/admin/intelligence", adminIntelligenceRoutes);
app.use(
  "/api/admin/intelligence",
  curriculumIntelligenceRoutes
);
app.use("/api/admin/activity", adminActivityRoutes);
app.use("/api/admin/activity-stream", adminActivityStreamRoutes);
app.use("/api/admin/reading-live", readingLiveRoutes);
app.use("/api/admin/reflections", adminReflectionRoutes);
app.use("/api/admin/reflection-insights", reflectionInsightsRoutes);
app.use("/api/admin/gate-suggestions", gateSuggestionsRoutes);
app.use("/api/admin/gate-assignments", gateAssignmentRoutes);
app.use("/api/admin/inquiries", inquiryReviewRoutes);
app.use("/api/admin/cohorts", cohortRoutes);
app.use("/api/admin/curriculum", curriculumRoutes);
app.use("/api/admin/curriculum-analytics", curriculumAnalyticsRoutes);
app.use("/api/admin/reading-windows", readingWindowRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/ledger", adminLedgerRoutes);
app.use("/api/admin/ledger-verify", adminLedgerVerifyRoutes);
app.use("/api/admin/refunds", adminRefundRoutes);
app.use("/api/admin/images", adminImageRoutes);
app.use("/api", lessonReflectionRoutes);


/* -------------------- WEBHOOKS -------------------- */

app.use("/webhooks/razorpay", razorpayWebhook);

/* -------------------- ERROR HANDLER -------------------- */

app.use(errorHandler);

/* -------------------- JOBS -------------------- */

setInterval(releaseStaleOrders, 5 * 60 * 1000);

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
