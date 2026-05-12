import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createReminderSchema = z.object({
  taskId: z.string(),
  scheduledAt: z.string().datetime(),
  message: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      ...(taskId && { taskId }),
      sent: false,
    },
    orderBy: { scheduledAt: "asc" },
    include: { task: { select: { title: true } } },
  });

  return NextResponse.json({ data: reminders });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createReminderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { taskId, scheduledAt, message } = parsed.data;

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      taskId,
      userId: session.user.id,
      scheduledAt: new Date(scheduledAt),
      message,
    },
  });

  return NextResponse.json({ data: reminder }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reminderId = searchParams.get("id");
  if (!reminderId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId: session.user.id },
  });

  if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.reminder.delete({ where: { id: reminderId } });
  return NextResponse.json({ data: { id: reminderId } });
}
