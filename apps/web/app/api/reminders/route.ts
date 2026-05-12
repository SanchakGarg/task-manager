import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createReminderSchema = z.object({
  taskId: z.string(),
  scheduledAt: z.string().datetime(),
  message: z.string().optional(),
});

const DEMO_REMINDERS = [
  { id: "r1", scheduledAt: new Date(Date.now() + 2 * 3600000), message: "Review wireframes with team", sent: false, taskId: "d1", userId: "demo", createdAt: new Date(), task: { title: "Design the new onboarding flow" } },
  { id: "r2", scheduledAt: new Date(Date.now() + 30 * 60000), message: "Deploy hotfix before EOD", sent: false, taskId: "d2", userId: "demo", createdAt: new Date(), task: { title: "Fix payment gateway timeout bug" } },
  { id: "r3", scheduledAt: new Date(Date.now() + 24 * 3600000), message: null, sent: false, taskId: "d3", userId: "demo", createdAt: new Date(), task: { title: "Write Q1 performance report" } },
];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ data: DEMO_REMINDERS });
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
    const body = await req.json();
    return NextResponse.json({ data: { id: `demo-rem-${Date.now()}`, ...body, sent: false, sentAt: null, createdAt: new Date() } }, { status: 201 });
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
    const { searchParams } = new URL(req.url);
    return NextResponse.json({ data: { id: searchParams.get("id") } });
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
