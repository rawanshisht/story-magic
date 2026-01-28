import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.child.findMany({
      where: { userId },
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
    const userId = await getAuthenticatedUserId();

    if (!userId) {
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

    if (!name || !age || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the user exists in the database before creating the child
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.error("User not found in database for userId:", userId);
      return NextResponse.json(
        { error: "User not found. Please sign out and sign back in." },
        { status: 404 }
      );
    }

    const child = await prisma.child.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        skinTone: skinTone || null,
        eyeColor: eyeColor || null,
        hairColor: hairColor || null,
        hairStyle: hairStyle || null,
        interests: typeof interests === 'string'
          ? interests.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0)
          : Array.isArray(interests) ? interests : [],
        userId,
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
