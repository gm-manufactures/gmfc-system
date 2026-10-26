import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // ✅ የጎደለው || ምልክት ተጨምሯል
    if (!memberId || !password) {
      Alert.alert("ስህተት", "እባክዎ የአባል መለያ እና የይለፍ ቃል ያስገቡ።");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://gmfc-system-1-gzw8.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId, password: password }),
        },
      );

      const data: any = await response.json();

      if (response.ok) {
        // 🔴 የተጠቃሚውን መረጃ በስልኩ ውስጥ ማስቀመጥ (በ feed.tsx ላይ እንዲነበብ)
        await AsyncStorage.setItem("loggedInUser", JSON.stringify(data.user));

        // ወደ ዋናው ገጽ (Dashboard) ሂድ
        router.replace("/dashboard");
      } else {
        // ✅ የጎደለው || ምልክት ተጨምሯል
        Alert.alert("መግቢያ አልተሳካም", data.error || "የተሳሳተ የአባል መለያ ወይም የይለፍ ቃል።");
      }
    } catch (error) {
      Alert.alert("የኔትወርክ ስህተት", "ከሰርቨሩ ጋር መገናኘት አልተቻለም።");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.formContainer}>
        <Text style={styles.logoText}>GMFC</Text>
        <Text style={styles.title}>እንኳን ደህና መጡ!</Text>
        <Text style={styles.subtitle}>የጋምቤላ ማጃንግ የጫካ ቡና</Text>

        <TextInput
          style={styles.input}
          placeholder="የአባል መለያ (Member ID)"
          value={memberId}
          onChangeText={setMemberId}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="የይለፍ ቃል (Password)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ግባ (Login)</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", justifyContent: "center" },
  formContainer: { paddingHorizontal: 30 },
  logoText: {
    fontSize: 45,
    fontWeight: "900",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#2e7d32",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    height: 55,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
