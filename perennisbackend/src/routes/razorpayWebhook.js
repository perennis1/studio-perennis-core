//src\routes\razorpayWebhook.js
// src/routes/razorpayWebhook.js
import express from "express";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { recordEvent } from "../lib/eventLedger.js";

const router = express.Router();

/**
 * Razorpay Webhook
 * Handles:
 * - payment.captured → finalize order, inventory, shipment, library
 * - payment.failed   → release inventory
 *
 * HARD GUARANTEES:
 * - Gateway-level idempotency (PaymentEvent)
 * - Business-level idempotency (order.paymentStatus)
 */
router.post(
  "/razorpay/webhook",
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
  async (req, res) => {
    try {
      /* ---------------- SIGNATURE VERIFICATION ---------------- */
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(500).send("Webhook secret not configured");
      }

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");

      const receivedSignature = req.headers["x-razorpay-signature"];
      if (expectedSignature !== receivedSignature) {
        return res.status(400).send("Invalid signature");
      }

      /* ---------------- EVENT PARSING ---------------- */
      const event = req.body;
      const eventId = event.id;
      const eventType = event.event;
      const payment = event?.payload?.payment?.entity;

      if (!eventId || !payment?.order_id) {
        return res.json({ ignored: true });
      }

      /* ---------------- GATEWAY IDEMPOTENCY ---------------- */
      try {
        await prisma.paymentEvent.create({
          data: {
            provider: "razorpay",
            eventId,
            payload: event,
          },
        });
      } catch (err) {
        // Duplicate Razorpay event → already processed
        return res.status(200).json({ received: true });
      }

      const razorpayOrderId = payment.order_id;

      /* ---------------- BUSINESS LOGIC ---------------- */
      await prisma.$transaction(async (tx) => {
        const order = await tx.bookOrder.findUnique({
          where: { razorpayOrderId },
          include: {
            items: { include: { variant: true } },
            shipment: true,
          },
        });

        // Business-level idempotency
        if (!order || order.paymentStatus !== "PENDING") {
          return;
        }

        /* ================= PAYMENT SUCCESS ================= */
        if (eventType === "payment.captured") {
          // Record payment (idempotent via @@unique(provider, providerRef))
          await tx.payment.create({
            data: {
              bookOrderId: order.id,
              provider: "razorpay",
              providerRef: payment.id,
              status: "PAID",
              amountPaise: payment.amount,
            },
          }).catch(() => {}); // safe if retried

          await tx.bookOrder.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              razorpayPaymentId: payment.id,
            },
          });

          for (const item of order.items) {
            /* -------- HARDCOPY INVENTORY -------- */
            if (item.variant.type === "HARDCOPY") {
              await tx.inventory.updateMany({
                where: { variantId: item.variantId },
                data: {
                  reserved: { decrement: item.quantity },
                  onHand: { decrement: item.quantity },
                },
              });

              await recordEvent(tx, {
                entityType: "INVENTORY",
                entityId: item.variantId,
                eventType: "COMMITTED",
                actorType: "SYSTEM",
                payload: {
                  orderId: order.id,
                  qty: item.quantity,
                },
              });
            }

            /* -------- PDF ACCESS GRANT -------- */
            if (item.variant.type === "PDF") {
              await tx.libraryEntry.upsert({
                where: {
                  userId_bookId_format: {
                    userId: order.userId,
                    bookId: item.variant.bookId,
                    format: "pdf",
                  },
                },
                update: {},
                create: {
                  userId: order.userId,
                  bookId: item.variant.bookId,
                  format: "pdf",
                },
              });
            }
          }

          /* -------- SHIPMENT (HARDCOPY ONLY) -------- */
          const hasHardcopy = order.items.some(
            (i) => i.variant.type === "HARDCOPY"
          );

          if (hasHardcopy && !order.shipment) {
            await tx.shipment.create({
              data: {
                orderId: order.id,
                status: "PENDING",
                addressSnapshot: {
                  name: order.contactName,
                  email: order.contactEmail,
                  phone: order.phone,
                  address: {
                    line1: order.shippingAddress,
                    city: order.shippingCity,
                    state: order.shippingState,
                    zip: order.shippingZip,
                    country: order.shippingCountry,
                  },
                },
              },
            });

            await recordEvent(tx, {
              entityType: "SHIPMENT",
              entityId: order.id,
              eventType: "CREATED",
              actorType: "SYSTEM",
              payload: { orderId: order.id },
            });
          }

          await recordEvent(tx, {
            entityType: "ORDER",
            entityId: order.id,
            eventType: "PAID",
            actorType: "SYSTEM",
            payload: {
              paymentId: payment.id,
              amount: payment.amount,
            },
          });
        }

        /* ================= PAYMENT FAILURE ================= */
        if (eventType === "payment.failed") {
          for (const item of order.items) {
            if (item.variant.type === "HARDCOPY") {
              await tx.inventory.updateMany({
                where: { variantId: item.variantId },
                data: { reserved: { decrement: item.quantity } },
              });

              await recordEvent(tx, {
                entityType: "INVENTORY",
                entityId: item.variantId,
                eventType: "RELEASED",
                actorType: "SYSTEM",
                payload: {
                  orderId: order.id,
                  qty: item.quantity,
                  reason: "PAYMENT_FAILED",
                },
              });
            }
          }

          await tx.bookOrder.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
          });

          await recordEvent(tx, {
            entityType: "ORDER",
            entityId: order.id,
            eventType: "FAILED",
            actorType: "SYSTEM",
            payload: { paymentId: payment.id },
          });
        }
      });

      return res.json({ received: true });
    } catch (err) {
      console.error("Razorpay webhook error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

export default router;
