import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Connections() {
  const router = useRouter();
  const { id, type, title } = useLocalSearchParams(); // type: 'followers' ወይም 'following'

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        // ✅ የጎደለው backtick ( ` ) ተጨምሯል
        const response = await fetch(
          `https://gmfc-system-1-gzw8.onrender.com/api/members/${id}/connections/${type}`,
        );
        const data = await response.json();
        if (response.ok) setUsers(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id && type) fetchConnections();
  }, [id, type]);

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        router.push({
          pathname: "/user-profile",
          params: { id: item.member_id, name: item.full_name },
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.full_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userId}>ID: {item.member_id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              ምንም ሰው አልተገኘም።
            </Text>
          }
        />
      )}
    </View>
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: "#2e7d32",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userId: { fontSize: 13, color: "#888" },
});
