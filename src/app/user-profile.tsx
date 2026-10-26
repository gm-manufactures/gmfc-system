import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserProfile() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });

  // 1. የገባውን ሰው መረጃ ከስልኩ ማንበብ
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("loggedInUser");
        if (userString) {
          const parsedUser = JSON.parse(userString);
          setCurrentUser({
            id: parsedUser.member_id || parsedUser.id,
            name: parsedUser.full_name || parsedUser.name,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadUser();
  }, []);

  // 2. የዚያን ሰው ፖስቶች ማምጣት
  const fetchUserPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/members/${id}/posts`,
      );
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. አንተ የዚያን ሰው መከተልህን ወይም አለመከተልህን ከሰርቨር ማረጋገጥ
  const checkFollowStatus = async () => {
    if (!currentUser.id || !id) return;
    try {
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/members/${id}/status/${currentUser.id}`,
      );
      const data = await response.json();
      if (response.ok) {
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 4. ገጹ ሲከፈት ወይም ወደ ሌላ ሰው ፕሮፋይል ሲቀየር ሁሉንም ነገር አድስ
  useEffect(() => {
    if (id) {
      setIsFollowing(false); // ከሌላ ሰው የመጣ ስቴት እንዳይወርስ መጀመሪያ አጽዳው
      fetchUserPosts();
      checkFollowStatus();
    }
  }, [id, currentUser.id]);

  // 5. የመከታተል እና የማቋረጥ ተግባር
  const handleFollowToggle = async () => {
    if (!currentUser.id) {
      Alert.alert("ስህተት", "እባክዎ መጀመሪያ ይግቡ");
      return;
    }

    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/members/${id}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentUserId: currentUser.id }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        Alert.alert("ስህተት", data.error || "ስህተት ተከስቷል");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም");
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <Text style={styles.postDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      ) : null}
    </View>
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
        <Text style={styles.headerTitle}>{name || "መገለጫ"}</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name ? name.toString().charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userId}>ID: {id}</Text>

        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && { backgroundColor: "#ccc" },
          ]}
          onPress={handleFollowToggle}
        >
          <Text style={styles.followButtonText}>
            {isFollowing ? "ተከታትያለሁ" : "ተከታተል"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>የተጠቃሚው ፖስቶች</Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              እስካሁን ምንም ፖስት የለም።
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
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: "#2e7d32",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  userId: { fontSize: 14, color: "#888", marginBottom: 15 },
  followButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  followButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
  },
  postDate: { fontSize: 12, color: "#888", marginBottom: 5 },
  postContent: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: { width: "100%", height: 200, borderRadius: 8 },
});
