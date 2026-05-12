"use client";

import { motion } from "framer-motion";
import { Calendar, FileText, Paperclip, Bell, MoreHorizontal, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@taskmanager/types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@taskmanager/types";

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onDelete: (taskId: string) => void;
  index: number;
}

const STATUS_ICONS = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  DONE: CheckCircle2,
  CANCELLED: AlertCircle,
};

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
  CANCELLED: "TODO",
};

export function TaskCard({ task, onOpen, onStatusChange, onDelete, index }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const StatusIcon = STATUS_ICONS[task.status];
  const overdue = isOverdue(task.dueDate) && task.status !== "DONE" && task.status !== "CANCELLED";
  const activeReminders = task.reminders?.filter((r) => !r.sent) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      layout
      className={cn(
        "group nb-card-hover cursor-pointer select-none",
        task.status === "DONE" && "opacity-70",
        task.status === "CANCELLED" && "opacity-50"
      )}
      onClick={() => onOpen(task)}
    >
      <div className="p-4">
        {/* Top row: status toggle + title + menu */}
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, NEXT_STATUS[task.status]);
            }}
            className={cn(
              "mt-0.5 flex-shrink-0 transition-transform duration-150 hover:scale-110",
              task.status === "DONE" ? "text-nb-success" : "text-muted-foreground hover:text-nb-primary"
            )}
            title={`Mark as ${NEXT_STATUS[task.status].toLowerCase().replace("_", " ")}`}
          >
            <StatusIcon size={20} strokeWidth={2.5} />
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-bold text-sm leading-tight line-clamp-2",
                task.status === "DONE" && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <MoreHorizontal size={14} />
          </Button>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="nb-tag text-xs">
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="nb-tag text-xs text-muted-foreground">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Bottom row: priority + due date + attachments */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge
            className="text-xs font-bold"
            style={{
              backgroundColor: priorityConfig.bg,
              color: priorityConfig.color,
              borderColor: priorityConfig.color,
            }}
          >
            {priorityConfig.label}
          </Badge>

          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                overdue ? "text-nb-danger" : "text-muted-foreground"
              )}
            >
              <Calendar size={11} />
              {formatDate(task.dueDate)}
              {overdue && " • Overdue"}
            </span>
          )}

          <div className="flex-1" />

          {(task.documents?.length > 0 || task.files?.length > 0) && (
            <div className="flex items-center gap-1">
              {task.documents?.length > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-semibold">
                  <FileText size={11} />
                  {task.documents.length}
                </span>
              )}
              {task.files?.length > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-semibold">
                  <Paperclip size={11} />
                  {task.files.length}
                </span>
              )}
            </div>
          )}

          {activeReminders.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-nb-accent font-bold">
              <Bell size={11} />
              {activeReminders.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
