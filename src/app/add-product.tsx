import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ ዋና ምድቦች
const CATEGORIES = [
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

// ✅ ንዑስ ምድቦች (Subcategories)
const SUBCATEGORIES: { [key: string]: string[] } = {
  መኪና: ["ቶዮታ", "ሱዙኪ", "ሌሎች መኪኖች"],
  ቤት: ["ለመኖሪያ", "ለንግድ", "መሬት"],
  "ሞተር ሳይክል": ["ባጃጅ", "ሞተር ብስክሌት"],
  ኤሌክትሮኒክስ: ["ስልክ", "ላፕቶፕ", "ቴሌቪዥን"],
  አልባሳት: [
    "የወንድ ልብስ",
    "የሴት ልብስ",
    "የህፃናት ልብስ",
    "ሂጃብ",
    "ሱፍ",
    "የውስጥ ልብስ",
    "የስፖርት ልብስ",
  ],
  ጫማዎች: ["የወንድ ጫማ", "የሴት ጫማ", "የስፖርት ጫማ"],
  "የቤት ውስጥ ዕቃዎች": ["ኩሽና", "ሳሎን", "መኝታ ቤት"],
  "ምንጣፍና ፍራሽ": ["ምንጣፍ", "ፍራሽ", "ትራስ"],
  "አንሶላና ትራስ": ["አንሶላ", "ትራስ"],
  ወርቅ: ["የወርቅ ጌጣጌጦች", "የወርቅ ቁራጭ"],
  ማር: ["የተፈጥሮ ማር", "የተጣራ ማር"],
  "ቅመማ ቅመም": ["በርበሬ", "ሽሮ", "ሌሎች"],
  "የቡና ዘር/ችግኝ": ["የቡና ዘር", "የቡና ችግኝ"],
  "የህንፃ ቁሳቁሶች": ["ሲሚንቶ", "ብረት", "ጡብ"],
};

export default function AddProduct() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ፎቶ የመምረጫ ተግባር
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("ፈቃድ ያስፈልጋል", "ፎቶ ለመምረጥ የፎቶ ማከማቻ ፈቃድ መስጠት አለብዎ።");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mimeType = result.assets[0].mimeType || "image/jpeg";
      setImage(`data:${mimeType};base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    if (!title || !price || !category) {
      if (Platform.OS === "web") {
        window.alert("እባክዎ ስም፣ ዋጋ እና ምድብ ያስገቡ።");
      } else {
        Alert.alert("ስህተት", "እባክዎ ስም፣ ዋጋ እና ምድብ ያስገቡ።");
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            price: price,
            category: category,
            subcategory: subcategory,
            description: description,
            image: image || "",
            seller_name: "GMFC Admin",
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        if (Platform.OS === "web") {
          window.alert("እቃው በተሳካ ሁኔታ ተመዝግቧል።");
          router.back();
        } else {
          Alert.alert("ስኬት!", "እቃው በተሳካ ሁኔታ ተመዝግቧል።", [
            { text: "እሺ", onPress: () => router.back() },
          ]);
        }
      } else {
        if (Platform.OS === "web") {
          window.alert(data.error || "ስህተት ተከስቷል።");
        } else {
          Alert.alert("ስህተት", data.error || "ስህተት ተከስቷል።");
        }
      }
    } catch {
      if (Platform.OS === "web") {
        window.alert("ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
      } else {
        Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        <View style={styles.formContainer}>
          {/* ፎቶ ማሳያ እና መምረጫ */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.imagePlaceholder}>📷 ፎቶ ይምረጡ</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>የእቃው ስም</Text>
          <TextInput
            style={styles.input}
            placeholder="ለምሳሌ፦ ቶዮታ ኮሮላ"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>ዋጋ (በብር)</Text>
          <TextInput
            style={styles.input}
            placeholder="ለምሳሌ፦ 1,200,000"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          {/* ✅ ዋና ምድብ መምረጫ */}
          <Text style={styles.label}>ምድብ (Category)</Text>
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
                  category === cat && styles.categoryPillActive,
                ]}
                onPress={() => {
                  setCategory(cat);
                  setSubcategory("");
                }}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    category === cat && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ✅ ንዑስ ምድብ መምረጫ */}
          {category && SUBCATEGORIES[category] && (
            <>
              <Text style={styles.label}>ንዑስ ምድብ (Subcategory)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {SUBCATEGORIES[category].map((subcat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryPill,
                      subcategory === subcat && styles.categoryPillActive,
                    ]}
                    onPress={() => setSubcategory(subcat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        subcategory === subcat && styles.categoryPillTextActive,
                      ]}
                    >
                      {subcat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>ዝርዝር መረጃ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="ስለ እቃው ተጨማሪ መረጃ ይጻፉ..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>አስቀምጥ</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>ወደ ኋላ ተመለስ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#2e7d32",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  formContainer: { paddingHorizontal: 20, paddingTop: 50 },
  imagePicker: {
    height: 200,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: { fontSize: 16, color: "#666", fontWeight: "bold" },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  backButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
  categoryScroll: {
    marginBottom: 15,
    marginTop: 5,
  },
  categoryPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: "#2e7d32",
  },

  categoryPillText: {
    color: "#333",
    fontWeight: "bold",
  },
  categoryPillTextActive: {
    color: "#fff",
  },
});
