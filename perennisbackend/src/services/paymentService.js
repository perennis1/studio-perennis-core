//C:\Users\studi\my-next-app\perennisbackend\src\services\paymentService.js
import * as razorpayService from "./paymentServiceRazorpay.js";

const PROVIDER = process.env.PAYMENT_PROVIDER || "razorpay";

export async function createCheckoutSession(
  userId,
  courseId,
  userEmail,
  courseSlug
) {
  if (PROVIDER === "razorpay") {
    return razorpayService.createCheckoutSession(
      userId,
      courseId,
      userEmail,
      courseSlug
    );
  }

  throw new Error("Unsupported payment provider");
}

export {
  razorpayService
};
