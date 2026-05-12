"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Table2, Upload, Bell, Trash2, ExternalLink, Plus,
  Loader2, Calendar, Tag, AlertCircle, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, formatDate, formatFileSize, getMimeTypeIcon } from "@/lib/utils";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@taskmanager/types";
import type { Task, TaskDocument, TaskFile } from "@taskmanager/types";

interface TaskDetailsProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

type Panel = "docs" | "files" | "reminders";

export function TaskDetails({ task, open, onClose, onUpdate, onDelete }: TaskDetailsProps) {
  const [activePanel, setActivePanel] = useState<Panel>("docs");
  const [loading, setLoading] = useState<string | null>(null);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];

  async function createDoc() {
    if (!newDocTitle.trim()) return;
    setLoading("create-doc");
    try {
      const res = await fetch("/api/google/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, title: newDocTitle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUpdate({ ...task, documents: [...(task.documents ?? []), json.data] });
      setNewDocTitle("");
      toast.success("Google Doc created and linked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create doc");
    } finally {
      setLoading(null);
    }
  }

  async function createSheet() {
    if (!newSheetTitle.trim()) return;
    setLoading("create-sheet");
    try {
      const res = await fetch("/api/google/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, title: newSheetTitle }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUpdate({ ...task, documents: [...(task.documents ?? []), json.data] });
      setNewSheetTitle("");
      toast.success("Google Sheet created and linked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create sheet");
    } finally {
      setLoading(null);
    }
  }

  async function linkDocument() {
    if (!linkUrl.trim()) return;
    const isSheet = linkUrl.includes("spreadsheets");
    const endpoint = isSheet ? "/api/google/sheets" : "/api/google/docs";
    setLoading("link-doc");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", taskId: task.id, url: linkUrl, title: linkTitle || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUpdate({ ...task, documents: [...(task.documents ?? []), json.data] });
      setLinkUrl("");
      setLinkTitle("");
      toast.success("Document linked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link document");
    } finally {
      setLoading(null);
    }
  }

  async function deleteDoc(docId: string, type: "doc" | "sheet") {
    setLoading(`del-doc-${docId}`);
    try {
      const endpoint = type === "sheet" ? "/api/google/sheets" : "/api/google/docs";
      const res = await fetch(`${endpoint}?id=${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      onUpdate({ ...task, documents: task.documents?.filter((d) => d.id !== docId) ?? [] });
      toast.success("Document removed");
    } catch {
      toast.error("Failed to remove document");
    } finally {
      setLoading(null);
    }
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading("upload");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", task.id);
      const res = await fetch("/api/google/drive", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUpdate({ ...task, files: [...(task.files ?? []), json.data] });
      toast.success("File uploaded to Google Drive!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteFile(fileId: string) {
    setLoading(`del-file-${fileId}`);
    try {
      const res = await fetch(`/api/google/drive?id=${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      onUpdate({ ...task, files: task.files?.filter((f) => f.id !== fileId) ?? [] });
      toast.success("File removed");
    } catch {
      toast.error("Failed to remove file");
    } finally {
      setLoading(null);
    }
  }

  async function addReminder() {
    if (!reminderDate) return;
    setLoading("reminder");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          scheduledAt: new Date(reminderDate).toISOString(),
          message: reminderMessage || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onUpdate({ ...task, reminders: [...(task.reminders ?? []), json.data] });
      setReminderDate("");
      setReminderMessage("");
      toast.success("Reminder set!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set reminder");
    } finally {
      setLoading(null);
    }
  }

  async function deleteReminder(reminderId: string) {
    setLoading(`del-rem-${reminderId}`);
    try {
      const res = await fetch(`/api/reminders?id=${reminderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onUpdate({ ...task, reminders: task.reminders?.filter((r) => r.id !== reminderId) ?? [] });
      toast.success("Reminder removed");
    } catch {
      toast.error("Failed to remove reminder");
    } finally {
      setLoading(null);
    }
  }

  const tabs: { id: Panel; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "docs", label: "Documents", icon: FileText, count: task.documents?.length },
    { id: "files", label: "Files", icon: Upload, count: task.files?.length },
    { id: "reminders", label: "Reminders", icon: Bell, count: task.reminders?.filter(r => !r.sent).length },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight">{task.title}</DialogTitle>
              {task.description && (
                <p className="mt-1.5 text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color, borderColor: priorityConfig.color }}
            >
              {priorityConfig.label}
            </Badge>
            <Badge
              style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, borderColor: statusConfig.color }}
            >
              {statusConfig.label}
            </Badge>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Calendar size={12} />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.tags?.map((tag) => (
              <span key={tag} className="nb-tag text-xs">
                <Tag size={10} />#{tag}
              </span>
            ))}
          </div>
        </DialogHeader>

        {/* Tab nav */}
        <div className="flex gap-1 border-b-2 border-nb-border -mx-6 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-0.5 transition-colors",
                  activePanel === tab.id
                    ? "border-nb-primary text-nb-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className="ml-0.5 rounded-full bg-nb-primary text-white text-xs px-1.5 py-0.5 leading-none font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-1 px-3 py-2.5 text-xs font-bold text-nb-danger border-b-2 border-transparent hover:border-nb-danger transition-colors mb-[-2px]"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* ---- DOCUMENTS PANEL ---- */}
              {activePanel === "docs" && (
                <div className="space-y-4">
                  {/* Existing docs */}
                  {(task.documents ?? []).length > 0 && (
                    <div className="space-y-2">
                      {task.documents!.map((doc) => (
                        <DocumentRow
                          key={doc.id}
                          doc={doc}
                          onDelete={() => deleteDoc(doc.id, doc.type === "GOOGLE_SHEET" ? "sheet" : "doc")}
                          loading={loading === `del-doc-${doc.id}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Create new doc */}
                  <div className="nb-card p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Create New</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Document title..."
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createDoc()}
                      />
                      <Button onClick={createDoc} disabled={!newDocTitle || loading === "create-doc"} size="sm">
                        {loading === "create-doc" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                        Doc
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Spreadsheet title..."
                        value={newSheetTitle}
                        onChange={(e) => setNewSheetTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createSheet()}
                      />
                      <Button onClick={createSheet} disabled={!newSheetTitle || loading === "create-sheet"} variant="secondary" size="sm">
                        {loading === "create-sheet" ? <Loader2 size={14} className="animate-spin" /> : <Table2 size={14} />}
                        Sheet
                      </Button>
                    </div>
                  </div>

                  {/* Link existing doc */}
                  <div className="nb-card p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Link Existing</p>
                    <Input
                      placeholder="Google Docs or Sheets URL..."
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Title (optional)"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                      />
                      <Button onClick={linkDocument} disabled={!linkUrl || loading === "link-doc"} variant="outline" size="sm">
                        {loading === "link-doc" ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                        Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- FILES PANEL ---- */}
              {activePanel === "files" && (
                <div className="space-y-4">
                  {(task.files ?? []).length > 0 && (
                    <div className="space-y-2">
                      {task.files!.map((file) => (
                        <FileRow
                          key={file.id}
                          file={file}
                          onDelete={() => deleteFile(file.id)}
                          loading={loading === `del-file-${file.id}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="nb-card p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={uploadFile}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading === "upload"}
                      variant="outline"
                      className="w-full h-20 flex-col gap-2 border-dashed"
                    >
                      {loading === "upload" ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <Upload size={24} />
                      )}
                      <span>{loading === "upload" ? "Uploading..." : "Click to upload file to Google Drive"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* ---- REMINDERS PANEL ---- */}
              {activePanel === "reminders" && (
                <div className="space-y-4">
                  {(task.reminders ?? []).length > 0 && (
                    <div className="space-y-2">
                      {task.reminders!.map((reminder) => (
                        <div
                          key={reminder.id}
                          className={cn(
                            "nb-card p-3 flex items-center justify-between gap-3",
                            reminder.sent && "opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell size={16} className={reminder.sent ? "text-muted-foreground" : "text-nb-accent"} />
                            <div>
                              <p className="text-sm font-bold">
                                {new Date(reminder.scheduledAt).toLocaleString()}
                              </p>
                              {reminder.message && (
                                <p className="text-xs text-muted-foreground">{reminder.message}</p>
                              )}
                              {reminder.sent && (
                                <span className="text-xs text-nb-success font-semibold">✓ Sent</span>
                              )}
                            </div>
                          </div>
                          {!reminder.sent && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteReminder(reminder.id)}
                              disabled={loading === `del-rem-${reminder.id}`}
                            >
                              {loading === `del-rem-${reminder.id}` ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="nb-card p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Add Reminder</p>
                    <div>
                      <Label className="text-xs mb-1 block">Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Message (optional)</Label>
                      <Input
                        placeholder="Custom reminder message..."
                        value={reminderMessage}
                        onChange={(e) => setReminderMessage(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={addReminder}
                      disabled={!reminderDate || loading === "reminder"}
                      className="w-full"
                    >
                      {loading === "reminder" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Set Reminder
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentRow({ doc, onDelete, loading }: { doc: TaskDocument; onDelete: () => void; loading: boolean }) {
  const icon = doc.type === "GOOGLE_SHEET" ? "📊" : doc.type === "GOOGLE_DOC" ? "📄" : "🔗";
  return (
    <div className="nb-card p-3 flex items-center gap-3 group">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground">{doc.type.replace("_", " ")}</p>
      </div>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground hover:text-nb-primary transition-colors"
      >
        <ExternalLink size={14} />
      </a>
      <Button variant="ghost" size="icon-sm" onClick={onDelete} disabled={loading}>
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </Button>
    </div>
  );
}

function FileRow({ file, onDelete, loading }: { file: TaskFile; onDelete: () => void; loading: boolean }) {
  return (
    <div className="nb-card p-3 flex items-center gap-3">
      <span className="text-xl">{getMimeTypeIcon(file.mimeType)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)} • Google Drive
        </p>
      </div>
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-nb-primary transition-colors"
      >
        <ExternalLink size={14} />
      </a>
      <Button variant="ghost" size="icon-sm" onClick={onDelete} disabled={loading}>
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </Button>
    </div>
  );
}
