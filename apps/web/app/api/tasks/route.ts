import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const DEMO_TASKS = [
  { id: "d1", title: "Design the new onboarding flow", description: "Create wireframes and hi-fi mockups for the new user onboarding experience. Focus on reducing time-to-value.", status: "IN_PROGRESS", priority: "HIGH", dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), tags: ["design", "ux"], position: 0, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [{ id: "dd1", title: "Onboarding Wireframes", type: "GOOGLE_DOC", googleId: "abc", url: "https://docs.google.com", taskId: "d1", createdAt: new Date() }], files: [], reminders: [{ id: "dr1", scheduledAt: new Date(Date.now() + 86400000), message: "Review with team", sent: false, sentAt: null, taskId: "d1", userId: "demo", createdAt: new Date() }] },
  { id: "d2", title: "Fix payment gateway timeout bug", description: "Users are reporting payment failures during peak hours. Investigate and fix the timeout issue.", status: "TODO", priority: "URGENT", dueDate: new Date(Date.now() + 86400000).toISOString(), tags: ["bug", "payments"], position: 1, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [{ id: "df1", name: "error-logs.txt", mimeType: "text/plain", size: 4096, googleDriveId: "xyz", url: "https://drive.google.com", thumbnailUrl: null, taskId: "d2", createdAt: new Date() }], reminders: [] },
  { id: "d3", title: "Write Q1 performance report", description: "Compile metrics from all teams and write the executive summary.", status: "TODO", priority: "MEDIUM", dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), tags: ["reporting"], position: 2, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [{ id: "dd2", title: "Q1 Metrics Sheet", type: "GOOGLE_SHEET", googleId: "def", url: "https://sheets.google.com", taskId: "d3", createdAt: new Date() }], files: [], reminders: [] },
  { id: "d4", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment to staging.", status: "TODO", priority: "MEDIUM", dueDate: null, tags: ["devops", "infra"], position: 3, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
  { id: "d5", title: "Migrate database to Neon PostgreSQL", description: "Move from Heroku Postgres to Neon for better scaling and branching.", status: "IN_PROGRESS", priority: "HIGH", dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), tags: ["database", "infra"], position: 4, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
  { id: "d6", title: "Update API documentation", description: "Sync the OpenAPI spec with recent endpoint changes and add code examples.", status: "TODO", priority: "LOW", dueDate: null, tags: ["docs"], position: 5, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
  { id: "d7", title: "Launch beta program", description: "Invite first 100 beta users. Set up feedback channels and support docs.", status: "DONE", priority: "HIGH", dueDate: new Date(Date.now() - 2 * 86400000).toISOString(), tags: ["launch", "marketing"], position: 6, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
  { id: "d8", title: "Implement dark mode", description: "Add CSS variable-based dark theme across all components.", status: "DONE", priority: "MEDIUM", dueDate: null, tags: ["ui", "feature"], position: 7, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
  { id: "d9", title: "Accessibility audit", description: "Run axe and screen reader tests on all critical user flows.", status: "CANCELLED", priority: "MEDIUM", dueDate: null, tags: ["a11y"], position: 8, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] },
];

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

  // Demo mode — return mock data without DB
  if (!session?.user?.id) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const priority = searchParams.get("priority");
    let tasks = DEMO_TASKS;
    if (search) tasks = tasks.filter(t => t.title.toLowerCase().includes(search) || t.tags.some(tag => tag.includes(search)));
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    return NextResponse.json({ data: tasks });
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
    // Demo mode — return a fake created task
    const body = await req.json();
    const fakeTask = { id: `demo-${Date.now()}`, ...body, tags: body.tags ?? [], status: body.status ?? "TODO", priority: body.priority ?? "MEDIUM", dueDate: body.dueDate ?? null, position: 99, userId: "demo", createdAt: new Date(), updatedAt: new Date(), documents: [], files: [], reminders: [] };
    return NextResponse.json({ data: fakeTask }, { status: 201 });
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
