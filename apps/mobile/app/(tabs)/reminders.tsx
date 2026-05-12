import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from "react-native";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://your-app.vercel.app";

interface Reminder {
  id: string;
  scheduledAt: string;
  message: string | null;
  sent: boolean;
  task: { title: string };
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reminders`, { credentials: "include" });
      const json = await res.json();
      if (json.data) setReminders(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await fetch(`${API_BASE}/api/reminders?id=${id}`, { method: "DELETE", credentials: "include" });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E84E10" />
      </View>
    );
  }

  return (
    <FlatList
      data={reminders}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: "#FFFDF5" }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.task.title}</Text>
              <Text style={styles.time}>{new Date(item.scheduledAt).toLocaleString()}</Text>
              {item.message && <Text style={styles.message}>{item.message}</Text>}
            </View>
          </View>
          {!item.sent && (
            <Pressable style={styles.deleteBtn} onPress={() => deleteReminder(item.id)}>
              <Text style={styles.deleteText}>✕</Text>
            </Pressable>
          )}
          {item.sent && <Text style={styles.sentBadge}>✓ Sent</Text>}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
          <Text style={styles.emptyTitle}>No reminders set</Text>
          <Text style={styles.emptyDesc}>Open a task to add a reminder</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#0A0A0A",
    padding: 14, flexDirection: "row", alignItems: "center",
    shadowColor: "#0A0A0A", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  cardLeft: { flex: 1, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  bellIcon: { fontSize: 20 },
  taskTitle: { fontSize: 14, fontWeight: "700", color: "#0A0A0A" },
  time: { fontSize: 12, color: "#6B7280", marginTop: 2, fontWeight: "600" },
  message: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 99, backgroundColor: "#FEE2E2",
    borderWidth: 2, borderColor: "#DC2626", alignItems: "center", justifyContent: "center",
  },
  deleteText: { fontSize: 11, fontWeight: "800", color: "#DC2626" },
  sentBadge: { fontSize: 11, fontWeight: "800", color: "#059669" },
  empty: { padding: 48, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#6B7280" },
  emptyDesc: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
});
