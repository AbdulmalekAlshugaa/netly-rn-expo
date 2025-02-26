import { Stack } from "expo-router";
import { NetworkStatusToast } from "netly-rn-expo";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
      <NetworkStatusToast toastHeight={80} />
      <Text>Welcome to my app!</Text>
    </View>
  );
}
