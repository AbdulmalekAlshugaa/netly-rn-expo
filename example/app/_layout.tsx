import NetworkStatusToast from "netly-rn-expo";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <NetworkStatusToast
        debug
        // Aggressive settings so slow connections are easy to demo:
        pollInterval={5000}
        slowThreshold={1000}
        onStatusChange={(status, prev) =>
          console.log(`network: ${prev} -> ${status}`)
        }
      />
      <Text>Welcome to my app!</Text>
      <Text style={{ marginTop: 8, color: "#888", textAlign: "center" }}>
        Toggle airplane mode or throttle the connection{"\n"}to see the toasts.
      </Text>
    </View>
  );
}
