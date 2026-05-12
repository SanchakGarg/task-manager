import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    if (Device.isDevice) {
      Notifications.requestPermissionsAsync().then(({ status }) => {
        if (status !== "granted") {
          console.warn("Notification permissions not granted");
        }
      });
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#FFFDF5" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#0A0A0A",
          headerTitleStyle: { fontWeight: "900" },
          contentStyle: { backgroundColor: "#FFFDF5" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Sign In", headerBackVisible: false }} />
        <Stack.Screen name="task/[id]" options={{ title: "Task Details" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
