import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createGoogleDoc, getGoogleDocTitle } from "@/lib/google";
import { z } from "zod";

const createDocSchema = z.object({
  taskId: z.string(),
  title: z.string().min(1).max(200),
});

const linkDocSchema = z.object({
  taskId: z.string(),
  url: z.string().url(),
  title: z.string().optional(),
});

// Create a new Google Doc and link to task
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "link") {
    const parsed = linkDocSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { taskId, url, title } = parsed.data;
    const docIdMatch = url.match(/\/document\/d\/([^/]+)/);
    if (!docIdMatch) {
      return NextResponse.json({ error: "Invalid Google Docs URL" }, { status: 400 });
    }

    const googleId = docIdMatch[1];
    const docTitle = title ?? (await getGoogleDocTitle(session.user.id, googleId));

    const doc = await prisma.taskDocument.create({
      data: { taskId, title: docTitle, type: "GOOGLE_DOC", googleId, url },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  }

  // Default: create new doc
  const parsed = createDocSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, title } = parsed.data;

  const { id: googleId, url, title: docTitle } = await createGoogleDoc(session.user.id, title);

  const doc = await prisma.taskDocument.create({
    data: { taskId, title: docTitle, type: "GOOGLE_DOC", googleId, url },
  });

  return NextResponse.json({ data: doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
