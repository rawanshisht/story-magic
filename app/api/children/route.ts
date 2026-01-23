import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.child.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      age,
      gender,
      skinTone,
      eyeColor,
      hairColor,
      hairStyle,
      interests,
    } = body;

    if (!name || !age || !gender || !skinTone || !eyeColor || !hairColor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const child = await prisma.child.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        skinTone,
        eyeColor,
        hairColor,
        hairStyle: hairStyle || null,
        interests: interests || [],
        userId: session.user.id,
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child profile" },
      { status: 500 }
    );
  }
}
