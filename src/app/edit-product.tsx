import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState((params.title as string) || "");
  const [price, setPrice] = useState((params.price as string) || "");
  const [category, setCategory] = useState((params.category as string) || "");
  const [description, setDescription] = useState(
    (params.description as string) || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const id = params.id as string;
  const image = params.image as string;

  const handleUpdate = async () => {
    // ✅ '||' (OR) አፕሬተር ተጨምሯል
    if (!title || !price || !category) {
      Alert.alert("ስህተት", "እባክዎ ስም፣ ዋጋ እና ምድብ ያስገቡ።");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ የጎደለው የባክቲክ ምልክት (`) ተጨምሯል
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, price, category, description }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("ስኬት!", "እቃው በተሳካ ሁኔታ ተስተካክሏል።");
        router.back();
      } else {
        Alert.alert("ስህተት", data.error || "እቃውን ማስተካከል አልተቻለም።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>እቃውን አስተካክል</Text>
      </View>

      <View style={styles.formContainer}>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        )}

        <Text style={styles.label}>የእቃው ስም</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>ዋጋ (በብር)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>ምድብ (Category)</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>ዝርዝር መረጃ</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>አስተካክል</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#f57c00",
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  formContainer: { paddingHorizontal: 20 },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
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
    backgroundColor: "#f57c00",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    height: 55,
    justifyContent: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  backButtonText: { color: "#333", fontSize: 16, fontWeight: "bold" },
});
