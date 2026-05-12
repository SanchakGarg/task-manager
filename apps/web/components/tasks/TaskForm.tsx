"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Task } from "@taskmanager/types";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "MEDIUM",
      status: task?.status ?? "TODO",
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tags, dueDate: data.dueDate || null }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save task");

      toast.success(task ? "Task updated!" : "Task created!");
      onSuccess(json.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          {...register("title")}
          className={errors.title ? "border-nb-danger" : ""}
        />
        {errors.title && (
          <p className="text-xs text-nb-danger font-semibold">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add details, context, or notes..."
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select
            defaultValue={watch("priority")}
            onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">🟢 Low</SelectItem>
              <SelectItem value="MEDIUM">🔵 Medium</SelectItem>
              <SelectItem value="HIGH">🟡 High</SelectItem>
              <SelectItem value="URGENT">🔴 Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            defaultValue={watch("status")}
            onValueChange={(v) => setValue("status", v as TaskFormData["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">⭕ To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">🔄 In Progress</SelectItem>
              <SelectItem value="DONE">✅ Done</SelectItem>
              <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" {...register("dueDate")} />
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addTag(); }
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addTag}>
            <Plus size={16} />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border-2 border-nb-border bg-nb-accent text-nb-border px-2 py-0.5 text-xs font-bold shadow-nb-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-nb-danger transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {task ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
