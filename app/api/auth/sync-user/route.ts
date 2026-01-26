import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { uid, email, name, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "UID and email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        id: uid,
        email,
        name: name || email.split("@")[0],
        image: photoURL,
      },
      update: {
        id: uid,
        name: name || undefined,
        image: photoURL || undefined,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
