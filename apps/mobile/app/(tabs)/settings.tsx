import { View, Text, Pressable, StyleSheet, Linking } from "react-native";

const APP_URL = process.env.EXPO_PUBLIC_API_URL || "https://your-app.vercel.app";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      {[
        { label: "Open Web App", onPress: () => Linking.openURL(APP_URL), icon: "🌐" },
        { label: "Privacy Policy", onPress: () => Linking.openURL(`${APP_URL}/privacy`), icon: "🔒" },
        { label: "Terms of Service", onPress: () => Linking.openURL(`${APP_URL}/terms`), icon: "📄" },
      ].map((item) => (
        <Pressable key={item.label} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={item.onPress}>
          <Text style={styles.rowIcon}>{item.icon}</Text>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <Text style={styles.version}>TaskFlow v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5", padding: 16 },
  heading: { fontSize: 28, fontWeight: "900", color: "#0A0A0A", marginBottom: 20 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#0A0A0A",
    padding: 16, marginBottom: 10,
    shadowColor: "#0A0A0A", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  rowPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 0, height: 0 } },
  rowIcon: { fontSize: 20 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0A0A0A" },
  chevron: { fontSize: 20, color: "#9CA3AF", fontWeight: "600" },
  version: { textAlign: "center", marginTop: 32, fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
});
