//C:\Users\studi\my-next-app\perennisbackend\src\services\paymentServiceRazorpay.js


import Razorpay from "razorpay";
import crypto from "crypto";

// -----------------------------
// Disabled helpers
// -----------------------------
function disabledCheckout() {
  return { disabled: true, message: "Payments disabled" };
}
function disabledVerify() {}
function disabledParse() {
  return null;
}

// -----------------------------
// Main
// -----------------------------
let razorpay;
let createCheckoutSession;
let verifyWebhookSignature;
let parseWebhook;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.log("⚠️ Razorpay disabled - missing credentials");

  createCheckoutSession = disabledCheckout;
  verifyWebhookSignature = disabledVerify;
  parseWebhook = disabledParse;

} else {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  /**
   * Create Razorpay Order
   * This DOES NOT enroll the user
   */
  createCheckoutSession = async function (
    userId,
    courseId,
    userEmail,
    courseSlug
  ) {
    const amountInPaise = 10000; // TODO: dynamic pricing later

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `course_${courseId}_${userId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: String(userId),
        courseId: String(courseId),
        courseSlug,
        userEmail,
      },
    });

    return {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  };

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature = function (req) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expected) {
      throw new Error("Invalid Razorpay webhook signature");
    }
  };

  /**
   * Parse webhook payload
   * Returns normalized payment event
   */
  parseWebhook = function (req) {
    const payload = req.body;

    if (payload.event !== "payment.captured") return null;

    const payment = payload.payload.payment.entity;

    return {
      provider: "razorpay",
      paymentId: payment.id,
      orderId: payment.order_id,
      userId: Number(payment.notes.userId),
      courseId: Number(payment.notes.courseId),
      amount: payment.amount,
      currency: payment.currency,
    };
  };
}

export {
  createCheckoutSession,
  verifyWebhookSignature,
  parseWebhook,
};
