import { Stack } from "expo-router";
import { NetworkStatusToast, useNetworkStatus } from "netly-rn-expo";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  const networkStatus = useNetworkStatus();
  useEffect(()=>{
    console.log('networkStatus', networkStatus);
  },[])
  return (
    <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
      <NetworkStatusToast 
      
      />
      <Text>Welcome to my app!</Text>
    </View>
  );
}
