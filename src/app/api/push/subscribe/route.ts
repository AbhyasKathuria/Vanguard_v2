import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { subscription, role, district } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid push subscription object." },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Missing cryptographic subscription keys (p256dh, auth)." },
        { status: 400 }
      );
    }

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
        userId: user?.id || null,
        role: role || user?.role || "citizen",
        district: district || user?.district || "Rampur",
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userId: user?.id || null,
        role: role || user?.role || "citizen",
        district: district || user?.district || "Rampur",
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: saved.id,
      message: "Push alert subscription active.",
    });
  } catch (error: any) {
    console.error("[Push Subscribe POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to register push subscription." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required." }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true, message: "Unsubscribed." });
  } catch (error: any) {
    console.error("[Push Subscribe DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove subscription." },
      { status: 500 }
    );
  }
}
