import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Messages() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/messages",
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        Alert.alert("ስህተት", "መልእክቶችን ማምጣት አልተቻለም።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const renderMessage = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() => {
        Alert.alert("የመልእክት ዝርዝር", item.message);
      }}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.sender}>
          👤 {item.sender_type === "admin" ? "አስተዳዳሪ" : "ተጠቃሚ"}
        </Text>
        <Text style={styles.date}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : ""}
        </Text>
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>መልእክቶች</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            መልእክቶች በመጫን ላይ...
          </Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 16, color: "#666", marginBottom: 15 }}>
            እስካሁን ምንም መልእክት የለም።
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchMessages}
          >
            <Text style={styles.refreshButtonText}>እንደገና ሞክር</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>ወደ ኋላ ተመለስ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#2e7d32",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sender: { fontSize: 14, fontWeight: "bold", color: "#2e7d32" },
  date: { fontSize: 12, color: "#888" },
  content: { fontSize: 15, color: "#333", lineHeight: 22 },
  refreshButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  refreshButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  backButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
