import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    gender: "",
    age: "",
    region: "",
    woreda: "",
    blood_type: "",
    password: "",
    confirmPassword: "",
  });

  // መጀመሪያ ያለውን መረጃ ሞላ
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("loggedInUser");
      if (stored) {
        const user = JSON.parse(stored);
        setFormData((prev) => ({
          ...prev,
          // ✅ የጎደሉት || ምልክቶች ተጨምረዋል
          full_name: user.full_name || "",
          phone: user.phone || "",
          email: user.email || "",
          gender: user.gender || "",
          age: user.age || "",
          region: user.region || "",
          woreda: user.woreda || "",
          blood_type: user.blood_type || "",
        }));
      }
    };
    loadUser();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // ✅ የፓስወርድ ማረጋገጫ ስራ
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("ስህተት", "የይለፍ ቃላቱ አይመሳሰሉም! እባክዎ በትክክል ያስገቡ።");
        return;
      }
      if (formData.password.length < 6) {
        Alert.alert("ስህተት", "የይለፍ ቃል ቢያንስ 6 ፊደሎች መሆን አለበት።");
        return;
      }
    }

    setIsLoading(true);
    try {
      // ✅ TypeScript ስህተትን ለማስወገድ : any ተጨምሯል
      const payload: any = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        age: formData.age,
        region: formData.region,
        woreda: formData.woreda,
        blood_type: formData.blood_type,
      };

      // ፓስወርድ ከተሞላ ብቻ ላክ
      if (formData.password) {
        payload.password = formData.password;
      }

      // ✅ የጎደለው የመጀመሪያ backtick ( ` ) ተጨምሯል
      const response = await fetch(
        `https://gmfc-system-1-gzw8.onrender.com/api/members/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        // AsyncStorage ውስጥ ያለውንም መረጃ አዘምን
        const stored = await AsyncStorage.getItem("loggedInUser");
        if (stored) {
          const user = JSON.parse(stored);
          const updatedUser = { ...user, ...payload };
          await AsyncStorage.setItem(
            "loggedInUser",
            JSON.stringify(updatedUser),
          );
        }

        Alert.alert("ተሳክቷል", "መረጃዎ በተሳካ ሁኔታ ተስተካክሏል!");
        router.back();
      } else {
        Alert.alert("ስህተት", "መረጃውን ማስቀመጥ አልተቻለም።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>መረጃ ማስተካከያ</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>የግል መረጃ</Text>

          <Text style={styles.label}>ሙሉ ስም</Text>
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(t) => handleChange("full_name", t)}
          />

          <Text style={styles.label}>ስልክ ቁጥር</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            keyboardType="phone-pad"
            onChangeText={(t) => handleChange("phone", t)}
          />

          <Text style={styles.label}>ኢሜል</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(t) => handleChange("email", t)}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>ጾታ</Text>
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(t) => handleChange("gender", t)}
              />
            </View>
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>እድሜ</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                keyboardType="numeric"
                onChangeText={(t) => handleChange("age", t)}
              />
            </View>
          </View>

          <Text style={styles.label}>ክልል</Text>
          <TextInput
            style={styles.input}
            value={formData.region}
            onChangeText={(t) => handleChange("region", t)}
          />

          <Text style={styles.label}>ወረዳ</Text>
          <TextInput
            style={styles.input}
            value={formData.woreda}
            onChangeText={(t) => handleChange("woreda", t)}
          />

          <Text style={styles.label}>የደም ዓይነት</Text>
          <TextInput
            style={styles.input}
            value={formData.blood_type}
            onChangeText={(t) => handleChange("blood_type", t)}
          />
        </View>

        {/* ✅ የይለፍ ቃል ማስተካከያ ክፍል */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            የይለፍ ቃል ማስተካከያ (ካልቀየሩ ባዶ ይተዉት)
          </Text>

          <Text style={styles.label}>አዲስ የይለፍ ቃል</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            secureTextEntry
            onChangeText={(t) => handleChange("password", t)}
          />

          <Text style={styles.label}>አዲሱን የይለፍ ቃል ያረጋግጡ</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            secureTextEntry
            onChangeText={(t) => handleChange("confirmPassword", t)}
          />
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>ለውጦችን አስቀምጥ</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  label: { fontSize: 14, color: "#666", marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2e7d32",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
}); // ✅ የጎደለው የመዝጊያ ቅንፍ ተጨምሯል
