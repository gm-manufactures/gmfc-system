import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductDetail() {
  const router = useRouter();
  const { id, title, price, image, category, description } =
    useLocalSearchParams();

  const handleContactSeller = () => {
    const phoneNumber = "0912345678";
    const message = "ስልክ ቁጥር: " + phoneNumber + "\nመደወል ይፈልጋሉ?";

    Alert.alert("ሻጩን ማግኘት", message, [
      { text: "ሰርዝ", style: "cancel" },
      {
        text: "ደውል",
        onPress: () => {
          Linking.openURL("tel:" + phoneNumber).catch(() => {
            Alert.alert("ስህተት", "መደወል አልተቻለም። እባክዎ ስልክዎን ያረጋግጡ።");
          });
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("እርግጠኛ ነህ?", "ይህን እቃ ማጥፋት ትፈልጋለህ?", [
      { text: "ሰርዝ", style: "cancel" },
      {
        text: "አጥፋ",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `https://gmfc-system-1-gzw8.onrender.com/api/products/${id}`,
              {
                method: "DELETE",
              },
            );
            if (response.ok) {
              Alert.alert("ስኬት", "እቃው በተሳካ ሁኔታ ተጥፏል።");
              router.back();
            } else {
              Alert.alert("ስህተት", "እቃውን ማጥፋት አልተቻለም።");
            }
          } catch (error) {
            Alert.alert("ስህተት", "የኔትወርክ ችግር አጋጥሟል።");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image as string }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImageContainer]}>
          <Text style={styles.noImageText}>📷 ፎቶ የለም</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price} ብር</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>ዝርዝር መረጃ</Text>
        <Text style={styles.description}>
          {description ? description : "ምንም ተጨማሪ መረጃ አልተሰጠም።"}
        </Text>

        <View style={styles.sellerContainer}>
          <Text style={styles.sellerTitle}>የሻጭ መረጃ</Text>
          <Text style={styles.sellerName}>GMFC Admin</Text>
          <Text style={styles.sellerPhone}>ስልክ: 0912345678</Text>
        </View>

        {/* ሻጩን ለማግኘት */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSeller}
        >
          <Text style={styles.contactButtonText}>ሻጩን ያግኙ (ደውል)</Text>
        </TouchableOpacity>

        {/* ማስተካከያ ቁልፍ */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/edit-product",
              params: { id, title, price, category, description, image },
            } as any)
          }
        >
          <Text style={styles.editButtonText}>✏️ አስተካክል (Edit)</Text>
        </TouchableOpacity>

        {/* ማጥፊያ ቁልፍ */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ እቃውን አጥፋ (Delete)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>ወደ ኋላ ተመለስ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 300, backgroundColor: "#ddd" },
  noImageContainer: { justifyContent: "center", alignItems: "center" },
  noImageText: { color: "#666", fontWeight: "bold", fontSize: 16 },
  content: { padding: 20 },
  category: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  price: {
    fontSize: 22,
    color: "#d32f2f",
    fontWeight: "bold",
    marginBottom: 15,
  },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 20,
  },
  sellerContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sellerName: { fontSize: 15, color: "#333" },
  sellerPhone: { fontSize: 15, color: "#333" },
  contactButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  contactButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // ✅ የ Edit ቁልፍ ስታይል (በትክክል ተለይቷል)
  editButton: {
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  backButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
});
