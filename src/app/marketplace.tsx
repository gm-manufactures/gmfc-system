import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// የምድቦች ዝርዝር
const CATEGORIES = [
  "ሁሉም",
  "መኪና",
  "ቤት",
  "ሞተር ሳይክል",
  "ኤሌክትሮኒክስ",
  "አልባሳት",
  "ጫማዎች",
  "የቤት ውስጥ ዕቃዎች",
  "ምንጣፍና ፍራሽ",
  "አንሶላና ትራስ",
  "ወርቅ",
  "ማር",
  "ቅመማ ቅመም",
  "የቡና ዘር/ችግኝ",
  "የህንፃ ቁሳቁሶች",
];

export default function Marketplace() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ሁሉም");

  const fetchProducts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/products",
      );
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        Alert.alert("ስህተት", "ዳታ ማምጣት አልተቻለም።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(false);
  };

  // በሁለቱም ፍለጋ እና ምድብ መሰረት ማጣራት (subcategory ን ጭምር)
  const filteredProducts = products.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.subcategory?.toLowerCase().includes(query); // ✅ subcategory ፍለጋ
    const matchesCategory =
      selectedCategory === "ሁሉም" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: "/product-detail",
          params: {
            id: item._id,
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category,
            subcategory: item.subcategory || "", // ✅ subcategory ተላልፏል
            description: item.description || "",
          },
        } as any);
      }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImageContainer]}>
          <Text style={styles.noImageText}>📷 ፎቶ የለም</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        {/* ✅ የምድብ እና ንዑስ ምድብ ማሳያ */}
        <Text style={styles.categoryText}>
          {item.category}
          {item.subcategory ? ` › ${item.subcategory}` : ""}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price} ብር</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>የግብይት ገጽ</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="እቃ ይፈልጉ..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* የምድቦች ማሸብለያ (Horizontal Category Filter) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 16, color: "#666", marginBottom: 15 }}>
            በዚህ ምድብ ወይም ፍለጋ ስር እቃ አልተገኘም።
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchProducts()}
          >
            <Text style={styles.refreshButtonText}>እንደገና ሞክር</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item: any) =>
            item._id?.toString() ||
            item.id?.toString() ||
            Math.random().toString()
          }
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
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
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    height: 45,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },

  categoryScroll: { marginTop: 5 },
  categoryPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillActive: { backgroundColor: "#fff" },
  categoryPillText: { color: "#fff", fontWeight: "bold" },
  categoryPillTextActive: { color: "#2e7d32" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
  },
  image: { width: "100%", height: 180, backgroundColor: "#ddd" },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  noImageText: { color: "#666", fontWeight: "bold" },
  infoContainer: { padding: 15 },
  categoryText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  price: { fontSize: 18, color: "#d32f2f", fontWeight: "bold" },
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
