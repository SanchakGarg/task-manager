"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, LayoutGrid, List, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { TaskDetails } from "./TaskDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@taskmanager/types";
import type { Task, TaskStatus } from "@taskmanager/types";

const COLUMNS: { status: TaskStatus; emoji: string }[] = [
  { status: "TODO", emoji: "⭕" },
  { status: "IN_PROGRESS", emoji: "🔄" },
  { status: "DONE", emoji: "✅" },
  { status: "CANCELLED", emoji: "❌" },
];

type ViewMode = "board" | "list";

export function TaskBoard({ defaultView = "board" }: { defaultView?: ViewMode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("TODO");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const res = await fetch(`/api/tasks?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setTasks(json.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Register push notification service worker
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to update status");
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (detailTask?.id === taskId) setDetailTask(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
      fetchTasks();
    }
  };

  const handleTaskSaved = (task: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = task;
        return next;
      }
      return [task, ...prev];
    });
    setFormOpen(false);
    setEditTask(null);
  };

  const handleTaskUpdate = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    setDetailTask(task);
  };

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    }
    return true;
  });

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dashboard"
        onSearch={setSearch}
        onNewTask={() => { setNewTaskStatus("TODO"); setFormOpen(true); }}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b-2 border-nb-border flex-shrink-0">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <Filter size={12} className="mr-1" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex items-center border-2 border-nb-border rounded-nb overflow-hidden">
          {(["board", "list"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors",
                viewMode === mode ? "bg-nb-primary text-white" : "bg-white hover:bg-muted"
              )}
            >
              {mode === "board" ? <LayoutGrid size={13} /> : <List size={13} />}
              {mode === "board" ? "Board" : "List"}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-nb border-2 border-nb-border">
          {filteredTasks.length} tasks
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-nb-primary" />
              <p className="text-sm font-bold text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        ) : viewMode === "board" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-full">
            {COLUMNS.map(({ status, emoji }) => {
              const colTasks = tasksByStatus(status);
              const config = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex flex-col gap-3 min-h-48">
                  {/* Column header */}
                  <div
                    className="flex items-center justify-between p-3 rounded-nb border-2 border-nb-border font-bold text-sm"
                    style={{ backgroundColor: config.bg, color: config.color, borderColor: config.color }}
                  >
                    <span className="flex items-center gap-2">
                      {emoji} {config.label}
                      <span className="bg-white border border-current rounded-full px-2 py-0.5 text-xs leading-none">
                        {colTasks.length}
                      </span>
                    </span>
                    <button
                      onClick={() => { setNewTaskStatus(status); setFormOpen(true); }}
                      className="hover:scale-110 transition-transform"
                      title={`Add ${config.label} task`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Tasks */}
                  <AnimatePresence mode="popLayout">
                    {colTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        onOpen={(t) => setDetailTask(t)}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>

                  {colTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 border-2 border-dashed border-nb-border rounded-nb flex items-center justify-center p-6 text-center"
                    >
                      <div>
                        <p className="text-2xl mb-1">{emoji}</p>
                        <p className="text-xs font-bold text-muted-foreground">
                          No {config.label.toLowerCase()} tasks
                        </p>
                        <button
                          onClick={() => { setNewTaskStatus(status); setFormOpen(true); }}
                          className="mt-2 text-xs font-bold text-nb-primary hover:underline flex items-center gap-1 mx-auto"
                        >
                          <Plus size={12} /> Add one
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="max-w-3xl mx-auto space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  onOpen={(t) => setDetailTask(t)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
            {filteredTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="nb-card p-16 text-center"
              >
                <p className="text-4xl mb-3">📋</p>
                <p className="font-black text-lg">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first task to get started
                </p>
                <Button className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus size={16} /> New Task
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit task dialog */}
      <Dialog open={formOpen || !!editTask} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditTask(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editTask ?? undefined}
            onSuccess={handleTaskSaved}
            onCancel={() => { setFormOpen(false); setEditTask(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Task details dialog */}
      {detailTask && (
        <TaskDetails
          task={detailTask}
          open={!!detailTask}
          onClose={() => setDetailTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={(id) => { handleDelete(id); setDetailTask(null); }}
        />
      )}
    </div>
  );
}
