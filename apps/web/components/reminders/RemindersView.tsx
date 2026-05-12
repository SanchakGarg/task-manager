"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, Plus, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DemoReminder {
  id: string;
  taskTitle: string;
  taskPriority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  scheduledAt: Date;
  message: string | null;
  sent: boolean;
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#059669",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#EF4444",
};

const INITIAL: DemoReminder[] = [
  { id: "r1", taskTitle: "Design the new onboarding flow", taskPriority: "HIGH", scheduledAt: new Date(Date.now() + 2 * 3600000), message: "Review wireframes with the team before standup", sent: false },
  { id: "r2", taskTitle: "Fix payment gateway timeout bug", taskPriority: "URGENT", scheduledAt: new Date(Date.now() + 30 * 60000), message: "URGENT: deploy hotfix before end of day", sent: false },
  { id: "r3", taskTitle: "Write Q1 performance report", taskPriority: "MEDIUM", scheduledAt: new Date(Date.now() + 24 * 3600000), message: null, sent: false },
  { id: "r4", taskTitle: "Set up CI/CD pipeline", taskPriority: "MEDIUM", scheduledAt: new Date(Date.now() + 3 * 24 * 3600000), message: "Don't forget to configure staging secrets", sent: false },
  { id: "r5", taskTitle: "Launch beta program", taskPriority: "HIGH", scheduledAt: new Date(Date.now() - 2 * 24 * 3600000), message: "Invite first 100 users", sent: true },
  { id: "r6", taskTitle: "Migrate database to Neon", taskPriority: "HIGH", scheduledAt: new Date(Date.now() - 5 * 3600000), message: null, sent: true },
];

function timeUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const past = diff < 0;
  if (days > 0) return `${past ? "" : "in "}${days}d ${past ? "ago" : ""}`.trim();
  if (hours > 0) return `${past ? "" : "in "}${hours}h ${past ? "ago" : ""}`.trim();
  return `${past ? "" : "in "}${mins}m ${past ? "ago" : ""}`.trim();
}

export function RemindersView() {
  const [reminders, setReminders] = useState<DemoReminder[]>(INITIAL);
  const [filter, setFilter] = useState<"upcoming" | "sent" | "all">("upcoming");

  const filtered = reminders.filter((r) => {
    if (filter === "upcoming") return !r.sent;
    if (filter === "sent") return r.sent;
    return true;
  });

  const upcoming = reminders.filter((r) => !r.sent);
  const sent = reminders.filter((r) => r.sent);

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reminder removed");
  };

  const markSent = (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, sent: true } : r)));
    toast.success("Marked as sent");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Reminders" />

      <div className="flex-1 overflow-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Upcoming", count: upcoming.length, icon: Bell, color: "bg-nb-accent", active: filter === "upcoming" },
            { label: "Sent", count: sent.length, icon: CheckCircle2, color: "bg-green-100", active: filter === "sent" },
            { label: "Total", count: reminders.length, icon: Calendar, color: "bg-blue-100", active: filter === "all" },
          ].map(({ label, count, icon: Icon, color, active }) => (
            <button
              key={label}
              onClick={() => setFilter(label.toLowerCase() as never)}
              className={cn(
                "nb-card p-4 text-left transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-nb-hover",
                active && "ring-2 ring-nb-primary ring-offset-2"
              )}
            >
              <div className={`w-10 h-10 ${color} rounded-nb border-2 border-nb-border flex items-center justify-center mb-3 shadow-nb-sm`}>
                <Icon size={18} />
              </div>
              <div className="text-3xl font-black">{count}</div>
              <div className="text-sm font-bold text-muted-foreground mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* Next reminder callout */}
        {upcoming.length > 0 && filter !== "sent" && (() => {
          const next = [...upcoming].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="nb-card p-4 mb-6 border-nb-primary border-2 bg-orange-50 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-nb-primary rounded-nb flex items-center justify-center flex-shrink-0 shadow-nb-sm">
                <Clock size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-nb-primary mb-0.5">Next reminder</p>
                <p className="font-black truncate">{next.taskTitle}</p>
                <p className="text-sm text-muted-foreground font-semibold">
                  {next.scheduledAt.toLocaleString()} · {timeUntil(next.scheduledAt)}
                </p>
              </div>
              <Badge variant="default" className="flex-shrink-0">
                {timeUntil(next.scheduledAt)}
              </Badge>
            </motion.div>
          );
        })()}

        {/* Reminder list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((reminder, i) => {
              const isOverdue = !reminder.sent && reminder.scheduledAt < new Date();
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                  className={cn("nb-card p-4 flex items-start gap-4", reminder.sent && "opacity-60")}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-nb border-2 border-nb-border flex items-center justify-center flex-shrink-0 shadow-nb-sm",
                    reminder.sent ? "bg-green-100" : isOverdue ? "bg-red-100" : "bg-nb-accent"
                  )}>
                    {reminder.sent ? <CheckCircle2 size={18} className="text-nb-success" /> :
                     isOverdue ? <AlertCircle size={18} className="text-nb-danger" /> :
                     <Bell size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={cn("font-black text-sm", reminder.sent && "line-through text-muted-foreground")}>
                        {reminder.taskTitle}
                      </p>
                      <div
                        className="nb-badge text-xs"
                        style={{
                          backgroundColor: PRIORITY_COLOR[reminder.taskPriority] + "22",
                          color: PRIORITY_COLOR[reminder.taskPriority],
                          borderColor: PRIORITY_COLOR[reminder.taskPriority],
                        }}
                      >
                        {reminder.taskPriority}
                      </div>
                      {isOverdue && !reminder.sent && (
                        <Badge variant="danger" className="text-xs">Overdue</Badge>
                      )}
                      {reminder.sent && (
                        <Badge variant="success" className="text-xs">Sent</Badge>
                      )}
                    </div>
                    {reminder.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{reminder.message}</p>
                    )}
                    <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar size={11} />
                      {reminder.scheduledAt.toLocaleString()}
                      {!reminder.sent && (
                        <span className={cn("ml-1 font-bold", isOverdue ? "text-nb-danger" : "text-nb-primary")}>
                          · {timeUntil(reminder.scheduledAt)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!reminder.sent && (
                      <Button variant="ghost" size="icon-sm" onClick={() => markSent(reminder.id)} title="Mark sent">
                        <CheckCircle2 size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteReminder(reminder.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="nb-card p-16 text-center"
            >
              <Bell size={40} className="mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-black text-lg">No {filter} reminders</p>
              <p className="text-sm text-muted-foreground mt-1">
                Open any task and set a reminder from the task details panel.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
