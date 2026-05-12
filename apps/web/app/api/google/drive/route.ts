import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFileToDrive } from "@/lib/google";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const taskId = formData.get("taskId") as string | null;

  if (!file || !taskId) {
    return NextResponse.json({ error: "Missing file or taskId" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadFileToDrive(
    session.user.id,
    file.name,
    file.type || "application/octet-stream",
    buffer
  );

  const taskFile = await prisma.taskFile.create({
    data: {
      taskId,
      name: uploaded.name,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      googleDriveId: uploaded.id,
      url: uploaded.url,
      thumbnailUrl: uploaded.thumbnailUrl,
    },
  });

  return NextResponse.json({ data: taskFile }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const file = await prisma.taskFile.findFirst({
    where: { id: fileId },
    include: { task: { select: { userId: true } } },
  });

  if (!file || file.task.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.taskFile.delete({ where: { id: fileId } });
  return NextResponse.json({ data: { id: fileId } });
}
