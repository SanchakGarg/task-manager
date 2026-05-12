import { Metadata } from "next";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <TaskBoard />;
}
