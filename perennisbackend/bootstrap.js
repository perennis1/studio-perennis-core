//C:\Users\studi\my-next-app\perennisbackend\bootstrap.js

// perennisbackend/bootstrap.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Resolve __dirname FIRST
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * LOAD ENV — FIRST, BEFORE ANY CHECKS OR IMPORTS
 */
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

/**
 * HARD ENV GUARDS (PRODUCTION SAFETY)
 */
const REQUIRED_ENV = [
  "DATABASE_URL",
  "JWT_SECRET",
  "FRONTEND_URL",
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env: ${key}`);
    process.exit(1);
  }
}

/**
 * OPTIONAL: visibility
 */
console.log("✅ Environment validated");

/**
 * BOOT SERVER (lazy import so env is guaranteed loaded)
 */
import("./server.js");
