import { NetworkStatusToast } from "netly-rn-expo";
import { Text, View } from "react-native";

export default function RootLayout() {

  return (
    <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
      <NetworkStatusToast />
      <Text>Welcome to my app!</Text>
    </View>
  );
}
