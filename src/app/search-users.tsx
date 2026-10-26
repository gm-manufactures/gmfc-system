import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchUsers() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // ✅ የጎደለው backtick ( ` ) ተጨምሯል
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/members/search?query=${text}`,
      );
      const data = await response.json();
      if (response.ok) {
        setResults(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSearching(false);
    }
  };

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
        <Text style={styles.headerTitle}>ፍለጋ (Search)</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="በስም ወይም በ Member ID ይፈልጉ..."
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      {isSearching ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            query.length > 0 && !isSearching ? (
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 20 }}
              >
                ምንም ተጠቃሚ አልተገኘም።
              </Text>
            ) : undefined // 👈 'null' ወደ 'undefined' ተቀይሯል
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
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
