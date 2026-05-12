export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type DocType = "GOOGLE_DOC" | "GOOGLE_SHEET" | "GOOGLE_SLIDE" | "LINK";

export interface TaskDocument {
  id: string;
  title: string;
  type: DocType;
  googleId: string;
  url: string;
  createdAt: Date;
  taskId: string;
}

export interface TaskFile {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  googleDriveId: string;
  url: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  taskId: string;
}

export interface Reminder {
  id: string;
  scheduledAt: Date;
  message: string | null;
  sent: boolean;
  sentAt: Date | null;
  createdAt: Date;
  taskId: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  tags: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  documents: TaskDocument[];
  files: TaskFile[];
  reminders: Reminder[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  position?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "#059669", bg: "#D1FAE5" },
  MEDIUM: { label: "Medium", color: "#3B82F6", bg: "#DBEAFE" },
  HIGH: { label: "High", color: "#F59E0B", bg: "#FEF3C7" },
  URGENT: { label: "Urgent", color: "#EF4444", bg: "#FEE2E2" },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: "To Do", color: "#6B7280", bg: "#F3F4F6" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6", bg: "#DBEAFE" },
  DONE: { label: "Done", color: "#059669", bg: "#D1FAE5" },
  CANCELLED: { label: "Cancelled", color: "#9CA3AF", bg: "#F9FAFB" },
};
