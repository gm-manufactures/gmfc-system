import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ ለ Followers/Following ቁጥር
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedData = await AsyncStorage.getItem("loggedInUser");
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);

            // ✅ የፎሎወርስ እና ፎሎዊንግ ቁጥር ከሰርቨር ማምጣት
            const memberId = parsedData.member_id || parsedData.id;
            if (memberId) {
              // ✅ የጎደለው backtick ( ` ) ተጨምሯል
              const res = await fetch(
                `https://gmfc-system-1-gzw8.onrender.com/api/members/${memberId}/stats`,
              );
              const statsData = await res.json();
              if (res.ok) {
                setStats(statsData);
              }
            }
          }
        } catch (error) {
          console.log("Error reading data", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{ marginTop: 10 }}>መረጃ በመጫን ላይ...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>መረጃ አልተገኘም</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>ወደ መግቢያ ተመለስ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* የላይኛው አርዕስት */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>የእኔ መገለጫ</Text>
        <Text style={styles.headerSubtitle}>የጋምቤላ ማጃንግ የጫካ ቡና</Text>
      </View>

      {/* ✅ የፎሎወርስ እና ፎሎዊንግ ቁጥር */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: "/connections",
              params: {
                id: userData.member_id || userData.id,
                type: "followers",
                title: "ተከታዮች",
              },
            })
          }
        >
          <Text style={styles.statNumber}>{stats.followers}</Text>
          <Text style={styles.statLabel}>ተከታዮች</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity
          style={styles.statBox}
          onPress={() =>
            router.push({
              pathname: "/connections",
              params: {
                id: userData.member_id || userData.id,
                type: "following",
                title: "የሚከታተላቸው",
              },
            })
          }
        >
          <Text style={styles.statNumber}>{stats.following}</Text>
          <Text style={styles.statLabel}>የሚከታተላቸው</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ የመገለጫ ማስተካከያ ቁልፍ */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: "/edit-profile",
            params: {
              id: userData._id || userData.id,
              member_id: userData.member_id,
              full_name: userData.full_name,
            },
          } as any)
        }
      >
        <Text style={styles.editButtonText}>✏️ መገለጫ አስተካክል</Text>
      </TouchableOpacity>

      {/* የግል መረጃ ካርድ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 የግል መረጃ</Text>

        <View style={styles.row}>
          <Text style={styles.label}>ሙሉ ስም:</Text>
          <Text style={styles.value}>{userData.full_name || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>የአባል መለያ:</Text>
          <Text style={styles.value}>{userData.member_id || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ስልክ:</Text>
          <Text style={styles.value}>{userData.phone || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ጾታ:</Text>
          <Text style={styles.value}>{userData.gender || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>እድሜ:</Text>
          <Text style={styles.value}>{userData.age || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>የትውልድ ቦታ / ክልል:</Text>
          <Text style={styles.value}>
            {/* ✅ የተስተካከለ የ template string አጻጻፍ */}
            {userData.region || "N/A"}
            {userData.woreda ? ` - ${userData.woreda}` : ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>የደም ዓይነት:</Text>
          <Text style={styles.value}>{userData.blood_type || "N/A"}</Text>
        </View>
      </View>

      {/* የአክሲዮን መረጃ ካርድ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 የአክሲዮን መረጃ</Text>
        <View style={styles.row}>
          <Text style={styles.label}>የአክሲዮን ብዛት:</Text>
          <Text style={styles.value}>{userData.shares || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>የአክሲዮን ድርሻ:</Text>
          <Text style={styles.value}>
            {userData.share_percentage || "0.00"}%
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>የተከፈለ ካፒታል:</Text>
          <Text style={styles.value}>{userData.capital || 0} ብር</Text>
        </View>
      </View>

      {/* የውረሽ መረጃ ካርድ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 የውረሽ መረጃ</Text>
        {userData.loan_amount > 0 ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>የወሰዱት ውረሽ:</Text>
              <Text style={styles.value}>{userData.loan_amount} ብር</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ቀሪ ውረሽ:</Text>
              <Text style={styles.value}>{userData.loan_balance || 0} ብር</Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>ምንም ውረሽ የለም</Text>
        )}
      </View>

      {/* የሚቀጥለው የውረሽ መረጃ (Next of Kin) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👨‍👩‍👧 የሚቀጥለው የውረሽ መረጃ</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ስም:</Text>
          <Text style={styles.value}>{userData.next_of_kin_name || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>አድራሻ:</Text>
          <Text style={styles.value}>
            {userData.next_of_kin_address || "N/A"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ስልክ:</Text>
          <Text style={styles.value}>
            {userData.next_of_kin_phone || "N/A"}
          </Text>
        </View>
      </View>

      {/* የኋላ ቁልፍ */}
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>ወደ ኋላ ተመለስ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    backgroundColor: "#2e7d32",
    padding: 25,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { color: "#a5d6a7", fontSize: 14, marginTop: 5 },

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: { alignItems: "center" },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#2e7d32" },
  statLabel: { fontSize: 14, color: "#666", marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: "#ddd" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: { fontSize: 15, color: "#666", fontWeight: "500" },
  value: {
    fontSize: 15,
    color: "#333",
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  emptyText: { fontSize: 15, color: "#999", fontStyle: "italic" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2e7d32",
    marginHorizontal: 15,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  editButton: {
    backgroundColor: "#1976d2",
    marginHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
