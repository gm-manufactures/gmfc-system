import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Dashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* የላይኛው ክፍል (Header) */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>እንኳን ደህና መጡ!</Text>
        <Text style={styles.title}>GMFC ዳሽቦርድ</Text>
      </View>

      {/* የዋና መረጃዎች ካርዶች */}
      <View style={styles.cardsContainer}>
        {/* የእኔ መገለጫ ካርድ */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/profile" as any)}
        >
          <Text style={styles.cardTitle}>የእኔ መገለጫ</Text>
          <Text style={styles.cardText}>የአባልነት መረጃዎን ይመልከቱ</Text>
        </TouchableOpacity>

        {/* የግብይት ገጽ ካርድ */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/marketplace" as any)}
        >
          <Text style={styles.cardTitle}>የግብይት ገጽ</Text>
          <Text style={styles.cardText}>መኪና፣ ቤት፣ ምርቶች ይመልከቱ</Text>
        </TouchableOpacity>

        {/* አዲስ እቃ መለጠፊያ ካርድ */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/add-product" as any)}
        >
          <Text style={styles.cardTitle}>አዲስ እቃ ይለጥፉ</Text>
          <Text style={styles.cardText}>መኪና፣ ቤት ወይም ምርት ይሽጡ</Text>
        </TouchableOpacity>

        {/* 🌐 ማህበራዊ መረብ (Feed) - ሰፊ ሆሪዞንታል ካርድ */}
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: "#e8f5e9",
              borderWidth: 1,
              borderColor: "#2e7d32",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
            },
          ]}
          onPress={() => router.push("/feed" as any)}
        >
          <View>
            <Text style={[styles.cardTitle, { color: "#1b5e20" }]}>
              ማህበራዊ መረብ (Feed)
            </Text>
            <Text style={[styles.cardText, { color: "#2e7d32" }]}>
              አዲስ ስራዎችን ይመልከቱ እና ያጋሩ
            </Text>
          </View>
          <Text style={{ fontSize: 30 }}>🌐</Text>
        </TouchableOpacity>

        {/* ✅ የድጋፍ ማዕከል (Chat) ካርድ - በትክክለኛው ቦታ ላይ ተቀምጧል */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/chat" as any)}
        >
          <Text style={styles.cardTitle}>የድጋፍ ማዕከል (Chat)</Text>
          <Text style={styles.cardText}>ከአስተዳዳሪው ጋር በቀጥታ ይወያዩ</Text>
        </TouchableOpacity>

        {/* መልእክቶች ካርድ */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/messages" as any)}
        >
          <Text style={styles.cardTitle}>መልእክቶች</Text>
          <Text style={styles.cardText}>ከአስተዳዳሪው የመጡ መልእክቶች</Text>
        </TouchableOpacity>
      </View>

      {/* የመውጫ ቁልፍ */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/" as any)}
      >
        <Text style={styles.logoutText}>ውጣ (Logout)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2e7d32",
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#a5d6a7",
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#d32f2f",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 50,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
