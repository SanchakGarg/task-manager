import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, Pressable, TextInput,
  StyleSheet, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import type { Task } from "@taskmanager/types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@taskmanager/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://your-app.vercel.app";

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${API_BASE}/api/tasks${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.data) setTasks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search tasks..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9CA3AF"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E84E10" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: task }) => {
            const priority = PRIORITY_CONFIG[task.priority];
            const status = STATUS_CONFIG[task.status];
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, task.status === "DONE" && styles.done]} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.color }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>
                {task.description && (
                  <Text style={styles.desc} numberOfLines={1}>{task.description}</Text>
                )}
                <View style={styles.cardMeta}>
                  <View style={[styles.priorityBadge, { backgroundColor: priority.bg, borderColor: priority.color }]}>
                    <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                  </View>
                  {task.dueDate && (
                    <Text style={styles.metaText}>📅 {new Date(task.dueDate).toLocaleDateString()}</Text>
                  )}
                  {task.documents?.length > 0 && (
                    <Text style={styles.metaText}>📄 {task.documents.length}</Text>
                  )}
                  {task.reminders?.filter(r => !r.sent).length > 0 && (
                    <Text style={[styles.metaText, { color: "#FBBF24" }]}>
                      🔔 {task.reminders.filter(r => !r.sent).length}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5" },
  search: {
    margin: 16, padding: 12, backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 2, borderColor: "#0A0A0A", fontSize: 14, fontWeight: "600",
    shadowColor: "#0A0A0A", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#0A0A0A",
    padding: 14, shadowColor: "#0A0A0A", shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4, gap: 6,
  },
  cardPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 0, height: 0 } },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#0A0A0A" },
  done: { textDecorationLine: "line-through", color: "#9CA3AF" },
  desc: { fontSize: 12, color: "#6B7280" },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  statusBadge: { borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: "800" },
  priorityBadge: { borderRadius: 99, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  priorityText: { fontSize: 10, fontWeight: "800" },
  metaText: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  empty: { padding: 48, alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#6B7280" },
});
