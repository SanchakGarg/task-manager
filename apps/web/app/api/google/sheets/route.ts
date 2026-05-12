import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGoogleSheet, getGoogleSheetTitle } from "@/lib/google";
import { z } from "zod";

const createSheetSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).max(200),
});

const linkSheetSchema = z.object({
  taskId: z.string(),
  url: z.string().url(),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    const body = await req.json();
    const demoSheet = { id: `demo-sheet-${Date.now()}`, title: body.title || "Untitled", type: "GOOGLE_SHEET", googleId: "demo", url: "https://sheets.google.com", taskId: body.taskId, createdAt: new Date() };
    return NextResponse.json({ data: demoSheet }, { status: 201 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "link") {
    const parsed = linkSheetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { taskId, url, title } = parsed.data;
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json({ error: "Invalid Google Sheets URL" }, { status: 400 });
    }

    const googleId = sheetIdMatch[1];
    const sheetTitle = title ?? (await getGoogleSheetTitle(session.user.id, googleId));

    const doc = await prisma.taskDocument.create({
      data: { taskId, title: sheetTitle, type: "GOOGLE_SHEET", googleId, url },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  }

  const parsed = createSheetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, title } = parsed.data;
  const { id: googleId, url, title: sheetTitle } = await createGoogleSheet(session.user.id, title);

  const doc = await prisma.taskDocument.create({
    data: { taskId, title: sheetTitle, type: "GOOGLE_SHEET", googleId, url },
  });

  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    const { searchParams } = new URL(req.url);
    return NextResponse.json({ data: { id: searchParams.get("id") } });
  }

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get("id");
  if (!docId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const doc = await prisma.taskDocument.findFirst({
    where: { id: docId },
    include: { task: { select: { userId: true } } },
  });

  if (!doc || doc.task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.taskDocument.delete({ where: { id: docId } });
  return NextResponse.json({ data: { id: docId } });
}
