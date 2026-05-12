import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, Pressable, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import type { Task, TaskStatus } from "@taskmanager/types";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@taskmanager/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://your-app.vercel.app";

const COLUMNS: { status: TaskStatus; emoji: string }[] = [
  { status: "TODO", emoji: "⭕" },
  { status: "IN_PROGRESS", emoji: "🔄" },
  { status: "DONE", emoji: "✅" },
];

export default function DashboardScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, { credentials: "include" });
      const json = await res.json();
      if (json.data) setTasks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const onRefresh = () => { setRefreshing(true); fetchTasks(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E84E10" />
      </View>
    );
  }

  const tasksByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E84E10" />}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>My Tasks</Text>
        <Text style={styles.subheading}>{tasks.length} total</Text>
      </View>

      {COLUMNS.map(({ status, emoji }) => {
        const colTasks = tasksByStatus(status);
        const config = STATUS_CONFIG[status];
        return (
          <View key={status} style={styles.column}>
            <View style={[styles.columnHeader, { backgroundColor: config.bg, borderColor: config.color }]}>
              <Text style={[styles.columnTitle, { color: config.color }]}>
                {emoji} {config.label}
              </Text>
              <View style={[styles.countBadge, { borderColor: config.color }]}>
                <Text style={[styles.countText, { color: config.color }]}>{colTasks.length}</Text>
              </View>
            </View>

            {colTasks.slice(0, 5).map((task) => {
              const priority = PRIORITY_CONFIG[task.priority];
              return (
                <Pressable
                  key={task.id}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => router.push(`/task/${task.id}`)}
                >
                  <Text style={[styles.cardTitle, task.status === "DONE" && styles.done]}>
                    {task.title}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: priority.bg, borderColor: priority.color }]}>
                      <Text style={[styles.priorityText, { color: priority.color }]}>
                        {priority.label}
                      </Text>
                    </View>
                    {task.dueDate && (
                      <Text style={styles.dueDate}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}

            {colTasks.length === 0 && (
              <View style={styles.emptyCol}>
                <Text style={styles.emptyText}>No tasks here</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5" },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { marginBottom: 4 },
  heading: { fontSize: 28, fontWeight: "900", color: "#0A0A0A" },
  subheading: { fontSize: 13, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  column: { gap: 8 },
  columnHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 12, borderRadius: 12, borderWidth: 2,
  },
  columnTitle: { fontSize: 13, fontWeight: "800" },
  countBadge: {
    borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#fff",
  },
  countText: { fontSize: 11, fontWeight: "800" },
  card: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#0A0A0A",
    padding: 12, shadowColor: "#0A0A0A", shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  cardPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 0, height: 0 } },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0A0A0A", marginBottom: 6 },
  done: { textDecorationLine: "line-through", color: "#9CA3AF" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityBadge: { borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  priorityText: { fontSize: 11, fontWeight: "800" },
  dueDate: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  emptyCol: { padding: 16, alignItems: "center", borderRadius: 12, borderWidth: 2, borderStyle: "dashed", borderColor: "#D1D5DB" },
  emptyText: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
});
