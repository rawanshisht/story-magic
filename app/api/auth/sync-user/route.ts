import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFirebaseUser, verifyFirebaseToken } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The user's identity comes from the verified token, never the request body.
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let email = decodedToken.email;
    if (!email) {
      email = (await getFirebaseUser(decodedToken.uid))?.email;
    }
    if (!email) {
      return NextResponse.json({ error: "Account has no email address" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const photoURL = typeof body.photoURL === "string" ? body.photoURL.slice(0, 2048) : "";

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (photoURL) updateData.image = photoURL;

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        id: decodedToken.uid,
        email,
        name: name || email.split("@")[0],
        image: photoURL || null,
      },
      update: updateData,
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
