import { Metadata } from "next";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export const metadata: Metadata = { title: "All Tasks" };

export default function TasksPage() {
  return <TaskBoard defaultView="list" />;
}
