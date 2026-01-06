// src/config/features.js
export const FEATURES = {
  PAYMENTS_ENABLED: Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ),

  REFLECTION_INSIGHTS: true,
  LIVE_READING_ADMIN: true,

  COMMUNITY: false,
  AI_INSIGHTS: false,
};
