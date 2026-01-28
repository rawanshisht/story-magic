import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAuthenticatedUserId } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { generatePDFForEmail } from "@/lib/pdf-generator-email";
import { getMoralById } from "@/config/morals";
import { StoryPage } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json({ error: "Email service not configured. Please add RESEND_API_KEY to environment variables." }, { status: 500 });
    }

    const userId = await getAuthenticatedUserId();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch story without cachedPdf first (for email template)
    const story = await prisma.story.findUnique({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        moral: true,
        content: true,
        cachedPdf: true,
        child: { select: { name: true } },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    let pdfBuffer: Buffer;

    // Use cached PDF if available
    if (story.cachedPdf) {
      console.log("[Email] Using cached PDF");
      pdfBuffer = Buffer.from(story.cachedPdf);
    } else {
      // Generate PDF
      const pages = story.content as unknown as StoryPage[];
      const moral = getMoralById(story.moral);

      console.log("[Email] Generating PDF for story:", story.title);
      try {
        const pdfStart = Date.now();
        pdfBuffer = await generatePDFForEmail({
          title: story.title,
          childName: story.child.name,
          moral: moral?.label || story.moral,
          pages,
        });
        console.log(`[Email] PDF generated in ${Date.now() - pdfStart}ms, size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`);

        // Cache PDF asynchronously
        prisma.story
          .update({
            where: { id },
            data: { cachedPdf: pdfBuffer },
          })
          .then(() => console.log("[Email] PDF cached"))
          .catch((err) => console.error("[Email] Failed to cache PDF:", err));
      } catch (pdfError) {
        console.error("[Email] PDF generation failed:", pdfError);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
      }
    }

    // Send email with PDF attachment
    console.log("[Email] Sending email to:", email);
    const emailStart = Date.now();
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Story Magic <onboarding@resend.dev>",
      to: email,
      subject: `Your Story: ${story.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; margin-bottom: 24px;">Your Magical Story is Here!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there!</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your personalized story <strong>"${story.title}"</strong> featuring <strong>${story.child.name}</strong> is attached as a PDF.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">We hope you enjoy reading it together!</p>
          <br/>
          <p style="color: #666; font-size: 14px;">
            With love,<br/>
            <strong>The Story Magic Team</strong>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">
            This story was created with Story Magic - personalized stories for children.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${story.title.replace(/[^a-zA-Z0-9 ]/g, "").trim()}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }

    console.log(`[Email] Email sent in ${Date.now() - emailStart}ms, id: ${data?.id}`);
    console.log(`[Email] Total time: ${Date.now() - startTime}ms`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Email] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
