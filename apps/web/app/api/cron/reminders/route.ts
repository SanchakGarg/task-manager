import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";

// Vercel Cron Job — runs every minute: "* * * * *"
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const dueReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      scheduledAt: { lte: now, gte: fiveMinutesAgo },
    },
    include: {
      task: { select: { title: true, id: true } },
      user: {
        include: { pushSubscriptions: true },
      },
    },
  });

  const results = await Promise.allSettled(
    dueReminders.map(async (reminder) => {
      const { user, task } = reminder;

      if (user.pushSubscriptions.length === 0) return;

      const payload = {
        title: "⏰ Task Reminder",
        body: reminder.message ?? `Time to work on: ${task.title}`,
        icon: "/icon.svg",
        badge: "/badge.png",
        url: `/dashboard?task=${task.id}`,
        tag: `reminder-${reminder.id}`,
      };

      await Promise.all(
        user.pushSubscriptions.map((sub) => sendPushNotification(sub, payload))
      );

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sent: true, sentAt: now },
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ data: { processed: dueReminders.length, sent, failed } });
}
