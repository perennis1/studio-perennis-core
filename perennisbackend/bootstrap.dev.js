import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

// Warn instead of crashing
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET missing (dev mode)");
}

// Start server
import("./server.js");
