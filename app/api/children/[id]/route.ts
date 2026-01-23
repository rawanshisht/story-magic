import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = await prisma.child.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json(child);
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Failed to fetch child" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const child = await prisma.child.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        name: body.name,
        age: parseInt(body.age),
        gender: body.gender,
        skinTone: body.skinTone,
        eyeColor: body.eyeColor,
        hairColor: body.hairColor,
        hairStyle: body.hairStyle || null,
        interests: body.interests || [],
      },
    });

    return NextResponse.json(child);
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.child.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child profile" },
      { status: 500 }
    );
  }
}
