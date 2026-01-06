import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get("orderId");

    if (!orderIdParam) {
      return NextResponse.json(
        { error: "orderId query param is required" },
        { status: 400 }
      );
    }

    const id = parseInt(orderIdParam, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid orderId" },
        { status: 400 }
      );
    }

    const order = await prisma.bookOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
