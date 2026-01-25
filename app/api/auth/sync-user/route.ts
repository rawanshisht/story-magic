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

    const existingUser = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: uid },
        data: {
          name: name || existingUser.name,
          image: photoURL || existingUser.image,
        },
      });
      return NextResponse.json({ success: true, user: existingUser });
    }

    const user = await prisma.user.create({
      data: {
        id: uid,
        email,
        name: name || email.split("@")[0],
        image: photoURL,
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
