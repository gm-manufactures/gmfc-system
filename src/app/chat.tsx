import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });

  const socket = useRef<any>(null);

  // 1. የገባውን ሰው መረጃ ማንበብ
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("loggedInUser");
        if (userString) {
          const parsedUser = JSON.parse(userString);
          setCurrentUser({
            // ✅ የጎደሉት || ምልክቶች ተጨምረዋል
            id: parsedUser.member_id || parsedUser.id || "GMFC001",
            name: parsedUser.full_name || parsedUser.name || "Test Member",
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadUser();
  }, []);

  // 2. የድሮ መልእክቶችን ከሰርቨር ማምጣት
  const fetchMessages = async (memberId: string) => {
    try {
      // ✅ backticks ተጨምረዋል
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/chats/${memberId}`,
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. የ Socket.io ግንኙነት ማዋቀር
  useEffect(() => {
    if (!currentUser.id) return;

    fetchMessages(currentUser.id);

    socket.current = io("https://gmfc-system-1-gzw8.onrender.com", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.current.emit("joinRoom", currentUser.id);

    socket.current.on("receiveMessage", (newMessage: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    });

    socket.current.on("adminReceiveMessage", (newMessage: any) => {
      if (
        newMessage.member_id === "ALL" ||
        newMessage.member_id === currentUser.id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [currentUser.id]);

  // 4. መልእክት መላኪያ (Socket.io + API Fallback)
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser.id) return;

    const newMessageData = {
      member_id: currentUser.id,
      sender_type: "user",
      message: messageText,
      // ✅ backticks ተጨምረዋል
      _id: `temp-${Date.now()}`,
    };

    // 1. በSocket በኩል ላክ
    if (socket.current && socket.current.connected) {
      socket.current.emit("sendMessage", newMessageData);
    }

    // 2. በተጨማሪም በቀጥታ ወደ ሰርቨሩ (API) ላክ
    try {
      // ✅ backticks ተጨምረዋል
      await fetch(`https://gmfc-system-1-gzw8.onrender.com/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: currentUser.id,
          sender_type: "user",
          message: messageText,
        }),
      });
    } catch (error) {
      console.log("Error saving message to DB:", error);
    }

    // በስክሪኑ ላይ ወዲያውኑ አሳይ
    setMessages((prev) => [...prev, newMessageData]);
    setMessageText("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_type === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.adminMessage,
        ]}
      >
        <Text style={isMe ? styles.myMessageText : styles.adminMessageText}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>የድጋፍ ማዕከል</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="መልእክትዎን ይጻፉ..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    backgroundColor: "#2e7d32",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  adminMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
    elevation: 1,
  },
  myMessageText: { color: "#fff", fontSize: 15 },
  adminMessageText: { color: "#333", fontSize: 15 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
