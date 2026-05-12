import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
      ...(status && { status: status as never }),
      ...(priority && { priority: priority as never }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      }),
    },
    include: {
      documents: true,
      files: true,
      reminders: { where: { sent: false }, orderBy: { scheduledAt: "asc" } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, status, priority, dueDate, tags } = parsed.data;

  const lastTask = await prisma.task.findFirst({
    where: { userId: session.user.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status ?? "TODO",
      priority: priority ?? "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags ?? [],
      position: (lastTask?.position ?? -1) + 1,
      userId: session.user.id,
    },
    include: {
      documents: true,
      files: true,
      reminders: true,
    },
  });

  return NextResponse.json({ data: task }, { status: 201 });
}
