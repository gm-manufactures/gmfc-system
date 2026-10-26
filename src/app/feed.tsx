import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// ✅ ለማውጫው (Drawer) እና ለአይኮኖች
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";

export default function Feed() {
  const router = useRouter();
  const navigation = useNavigation();

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // ✅ የኮመንት ስቴቶች
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  // 👇 የገባውን ሰው መረጃ ለመያዝ
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });

  // 👇 ገጹ ሲከፈት የገባውን ሰው መረጃ ከስልኩ ማህደረ ትውስታ አንብብ
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
        } else {
          setCurrentUser({ id: "GMFC001", name: "Test Member" });
        }
      } catch (error) {
        console.log("Error loading user", error);
      }
    };
    loadUser();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/posts",
      );
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      }
    } catch (error) {
      Alert.alert("ስህተት", "ፖስቶችን ማምጣት አልተቻለም።");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      // ✅ የጎደለው backtick ( ` ) ተጨምሯል
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !image) {
      Alert.alert("ማሳሰቢያ", "እባክዎ ጽሑፍ ይጻፉ ወይም ፎቶ ይምረጡ።");
      return;
    }
    setIsPosting(true);
    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/posts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author_id: currentUser.id,
            author_name: currentUser.name,
            content: newPostText,
            // ✅ የጎደለው || ተጨምሯል
            image: image || "",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("ተሳክቷል", "ፖስትዎ በተሳካ ሁኔታ ተለጥፏል!");
        setNewPostText("");
        setImage(null);
        fetchPosts();
      } else {
        // ✅ የጎደለው || ተጨምሯል
        Alert.alert("ስህተት", data.error || "ፖስት ማድረግ አልተቻለም።");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, likes: p.likes + 1 } : p)),
      );
      // ✅ የጎደለው backtick ( ` ) ተጨምሯል
      await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/posts/${id}/like`,
        { method: "PUT" },
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ አዲስ የተጨመረ፦ ፖስት ማጥፊያ ፈንክሽን
  const handleDeletePost = (postId: string) => {
    Alert.alert("ፖስት ማጥፋት", "ይህን ፖስት በእርግጥ ማጥፋት ይፈልጋሉ?", [
      { text: "አይ", style: "cancel" },
      {
        text: "አጥፋ",
        style: "destructive",
        onPress: async () => {
          try {
            // ✅ የጎደለው backtick ( ` ) ተጨምሯል
            const response = await fetch(
              `https://gmfc-system-1-gzw8.onrender.com/api/posts/${postId}`,
              { method: "DELETE" },
            );
            if (response.ok) {
              setPosts((prev) => prev.filter((p) => p._id !== postId));
            } else {
              Alert.alert("ስህተት", "ፖስቱን ማጥፋት አልተቻለም።");
            }
          } catch (error) {
            Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
          }
        },
      },
    ]);
  };

  // ✅ አዲስ ኮመንት መላኪያ ፈንክሽን
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      // ✅ የጎደለው backtick ( ` ) ተጨምሯል
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/posts/${selectedPost._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author_id: currentUser.id,
            author_name: currentUser.name,
            text: commentText,
          }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        const updatedPosts = posts.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: data.comments } : p,
        );
        setPosts(updatedPosts);
        setSelectedPost({ ...selectedPost, comments: data.comments });
        setCommentText("");
      } else {
        Alert.alert("ስህተት", "ኮመንት ማድረግ አልተቻለም።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsCommenting(false);
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          onPress={() =>
            router.push({
              pathname: "/user-profile",
              params: { id: item.author_id, name: item.author_name },
            })
          }
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.author_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.author_name}</Text>
            <Text style={styles.postDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ✅ የማጥፊያ ቁልፍ (የራሱን ፖስት ከሆነ ብቻ ይታያል) */}
        {item.author_id === currentUser.id && (
          <TouchableOpacity
            onPress={() => handleDeletePost(item._id)}
            style={{ padding: 5 }}
          >
            <Ionicons name="trash-outline" size={20} color="#d32f2f" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      ) : null}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => handleLike(item._id)}
        >
          <Text style={styles.likeText}>👍 Like ({item.likes})</Text>
        </TouchableOpacity>

        {/* ✅ ኮመንት ለመክፈት */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => {
            setSelectedPost(item);
            setIsCommentModalVisible(true);
          }}
        >
          {/* ✅ የጎደለው || ተጨምሯል */}
          <Text style={styles.commentText}>
            💬 Comment ({item.comments?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ✅ የፌስቡክ አይነት ራስጌ (Header) */}
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="menu" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GMFC Feed</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          {/* ✅ የፍለጋ ቁልፍ (TypeScript ስህተትን ለማስወገድ as any ተጠቅመናል) */}
          <TouchableOpacity onPress={() => router.push("/search-users" as any)}>
            <Ionicons name="search" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.input}
          placeholder="ምን አዲስ ነገር አለ? እዚህ ይጻፉ..."
          value={newPostText}
          onChangeText={setNewPostText}
          multiline
        />

        {image && (
          <View style={{ position: "relative", marginTop: 10 }}>
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 150, borderRadius: 8 }}
            />
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "red",
                padding: 5,
                borderRadius: 15,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>📷 ፎቶ ጨምር</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePost}
            disabled={isPosting}
          >
            {isPosting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>ለጥፍ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ✅ የኮመንት ሳጥን (Modal) */}
      <Modal
        visible={isCommentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {/* ✅ የጎደለው || ተጨምሯል */}
              <Text style={styles.modalTitle}>
                ኮመንቶች ({selectedPost?.comments?.length || 0})
              </Text>
              <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              // ✅ የጎደለው || ተጨምሯል
              data={selectedPost?.comments || []}
              keyExtractor={(item, index) => index.toString()}
              style={{ flex: 1, padding: 15 }}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.author_name}</Text>
                  <Text style={styles.commentBody}>{item.text}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text
                  style={{ textAlign: "center", color: "#888", marginTop: 20 }}
                >
                  እስካሁን ኮመንት የለም። መጀመሪያው ይሁኑ!
                </Text>
              }
            />

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="ኮመንት ይጻፉ..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.sendCommentBtn}
                onPress={handleAddComment}
                disabled={isCommenting}
              >
                {isCommenting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>ላክ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  createPostContainer: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },
  imageButton: {
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  imageButtonText: { color: "#2e7d32", fontWeight: "bold" },
  postButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  postButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: "#2e7d32",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  authorName: { fontWeight: "bold", fontSize: 16, color: "#333" },
  postDate: { fontSize: 12, color: "#888" },
  postContent: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  postFooter: {
    // ✅ የተስተካከለ ስታይል (flexDirection)
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 5,
  },
  likeButton: { marginRight: 20 },
  likeText: { color: "#2e7d32", fontWeight: "bold" },
  commentButton: {},
  commentText: { color: "#666" },

  // ✅ ለኮመንት ሳጥን ስታይሎች
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    height: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#2e7d32" },
  commentItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentAuthor: { fontWeight: "bold", color: "#2e7d32", marginBottom: 4 },
  commentBody: { color: "#333", fontSize: 14 },
  commentInputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendCommentBtn: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
  },
});
