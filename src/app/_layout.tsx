import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// ✅ 1. የማሳወቂያ ቅንብር (ለአዲሱ Expo ስሪት)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // ማሳወቂያው በራሱ ላይ እንዲታይ
    shouldShowList: true, // በማሳወቂያ ዝርዝር ውስጥ እንዲታይ
    shouldPlaySound: true, // ድምጽ እንዲያሰማ
    shouldSetBadge: false, // በአፕ አይኮን ላይ ቁጥር እንዳይጨምር
  }),
});

export default function Layout() {
  // ✅ 2. የ Push Token ማግኛ እና ወደ ሰርቨር መላኪያ
  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return;
      }

      const { status: existingStatus } =
        (await Notifications.getPermissionsAsync()) as any;
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } =
          (await Notifications.requestPermissionsAsync()) as any;
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
          .data;
        console.log("Expo Push Token:", token);

        const userString = await AsyncStorage.getItem("loggedInUser");
        if (userString) {
          const user = JSON.parse(userString);
          const memberId = user.member_id || user.id;

          // ✅ backticks ተጨምረዋል (ከዚህ በፊት የጎደሉ ነበሩ)
          await fetch(
            `https://gmfc-system-1-gzw8.onrender.com/api/members/${memberId}/push-token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            },
          );
        }
      } catch (error) {
        console.log("Error getting push token:", error);
      }
    }

    registerForPushNotificationsAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#2e7d32",
          drawerInactiveTintColor: "#333",
        }}
      >
        <Drawer.Screen
          name="feed"
          options={{
            title: "ማህበራዊ መረብ (Feed)",
            drawerIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="index"
          options={{
            title: "ዳሽቦርድ (Dashboard)",
            drawerIcon: ({ color }) => (
              <Ionicons name="grid" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: "የእኔ መገለጫ",
            drawerIcon: ({ color }) => (
              <Ionicons name="person" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="marketplace"
          options={{
            title: "የግብይት ገጽ",
            drawerIcon: ({ color }) => (
              <Ionicons name="cart" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="add-product"
          options={{
            title: "አዲስ እቃ ይለጥፉ",
            drawerIcon: ({ color }) => (
              <Ionicons name="add-circle" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="messages"
          options={{
            title: "መልእክቶች",
            drawerIcon: ({ color }) => (
              <Ionicons name="mail" size={24} color={color as string} />
            ),
          }}
        />
        <Drawer.Screen
          name="chat"
          options={{
            title: "የድጋፍ ማዕከል",
            drawerIcon: ({ color }) => (
              <Ionicons name="chatbubbles" size={24} color={color as string} />
            ),
          }}
        />

        {/* በማውጫው ላይ የማይታዩ ገጾች */}
        <Drawer.Screen
          name="user-profile"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="edit-profile"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="connections"
          options={{ drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="search-users"
          options={{ drawerItemStyle: { display: "none" } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
