import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StoryPDF } from "@/components/story/StoryPDF";
import { StoryPage } from "@/types";
import { getMoralById } from "@/config/morals";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const story = await prisma.story.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { child: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const pages = story.content as unknown as StoryPage[];
    const moral = getMoralById(story.moral);

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      StoryPDF({
        title: story.title,
        childName: story.child.name,
        moral: moral?.label || story.moral,
        pages,
      })
    );

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${story.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
