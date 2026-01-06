// app/api/orders/checkout/route.ts
// app/api/orders/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userId = body.userId as number | undefined;
    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const items = (body.items || []) as Array<{
      id: number;
      bookId?: number;
      format?: "pdf" | "hardcopy";
      price?: number;
      quantity?: number;
    }>;

    const contact = body.contact as { name: string; email: string; phone?: string;};
    const shipping = body.shipping as
      | {address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      deliveryNotes?: string; }
      | null;

    const pdfItems = items.filter((i) => i.format === "pdf");
    const hardcopyItems = items.filter((i) => i.format === "hardcopy");

    const totalAmount = items.reduce((sum, item) => {
      const price = item.price ?? 0;
      const qty = item.quantity ?? 1;
      return sum + price * qty;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.bookOrder.create({
        data: {
          userId,
          contactName: contact.name,
          contactEmail: contact.email,
           phone: contact.phone ?? null,
          shippingAddress: shipping
      ? [shipping.address1, shipping.address2].filter(Boolean).join(", ")
      : null,
          shippingCity: shipping?.city ?? null,
          shippingState: shipping?.state ?? null,
          shippingZip: shipping?.zip ?? null,
          shippingCountry: shipping?.country ?? null,
          deliveryNotes: shipping?.deliveryNotes ?? null,
          totalAmount,
          currency: "INR",
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              bookId: item.bookId ?? item.id,
              format: item.format ?? "pdf",
              unitPrice: item.price ?? 0,
              quantity: item.quantity ?? 1,
            })),
          },
        },
      });

      if (pdfItems.length > 0) {
        await tx.libraryEntry.createMany({
          data: pdfItems.map((item) => ({
            userId,
            bookId: item.bookId ?? item.id,
            format: "pdf",
          })),
          skipDuplicates: true,
        });
      }

      return createdOrder;
    });

    return NextResponse.json(
      {
        orderId: order.id,
        hasPdf: pdfItems.length > 0,
        hasHardcopy: hardcopyItems.length > 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }
}
