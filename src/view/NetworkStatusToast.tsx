import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  InteractionManager,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { connectionMessages, NetworkStatus } from "../constants/NetLy";

// Configuration constants

interface NetworkStatusToastProps {
  disconnectedColor?: string;
  connectedColor?: string;
  slowConnectionColor?: string;
  toastHeight?: number;
  animationDuration?: number;
  dismissTimeout?: number;
  messageNoConnection?: string;
  messageConnected?: string;
  messageSlowConnection?: string;
  contentStyle?: View["props"]["style"];
  toastTextStyle?: Text["props"]["style"];
}

const NetworkStatusToast: React.FC<NetworkStatusToastProps> = ({
  disconnectedColor = "#F44336", // Default Red
  connectedColor = "#4CAF50", // Default Green
  slowConnectionColor = "#FFC107", // Default Yellow
  toastHeight = 34,
  animationDuration = 400,
  dismissTimeout = 3000,
  messageNoConnection = connectionMessages.NO_CONNECTION,
  messageConnected = connectionMessages.CONNECTED,
  messageSlowConnection = connectionMessages.SLOW_CONNECTION,
  contentStyle,
  toastTextStyle,
}) => {
  const [networkState, prevNetworkState] = useNetworkStatus();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState(connectedColor);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // When network goes down
    if (
      networkState === NetworkStatus.NO_CONNECTION &&
      networkState !== prevNetworkState
    ) {
      setToastMessage(messageNoConnection);
      setToastColor(disconnectedColor);
      show();
    }
    // When network is restored
    else if (
      prevNetworkState === NetworkStatus.NO_CONNECTION &&
      networkState === NetworkStatus.CONNECTED
    ) {
      setToastMessage(messageConnected);
      setToastColor(connectedColor);
      show();
    }
    // When network becomes slow
    else if (
      prevNetworkState === NetworkStatus.CONNECTED &&
      networkState === NetworkStatus.SLOW_CONNECTION
    ) {
      setToastMessage(messageSlowConnection);
      setToastColor(slowConnectionColor);
      show();
    }

    // Always schedule a dismiss when network is connected (or restored)
    if (networkState === NetworkStatus.CONNECTED) {
      const timeout = setTimeout(() => dismiss(), dismissTimeout);
      return () => clearTimeout(timeout);
    }
  }, [networkState]);

  const show = () => {
    InteractionManager.runAfterInteractions(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false,
      }).start(() => setShowToast(true));
    });
  };

  const dismiss = () => {
    // Dismiss regardless of previous state if network is connected
    if (networkState === NetworkStatus.CONNECTED) {
      InteractionManager.runAfterInteractions(() => {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: false,
        }).start(() => setShowToast(false));
      });
    }
  };

  const toastAnimateStyle = {
    height: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, toastHeight],
    }),
    paddingTop: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, toastHeight / 2],
    }),
    marginBottom: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -toastHeight],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", toastColor],
    }),
  };

  if (!showToast) {
    return null;
  }

  return (
    <Animated.View style={[styles.toast, toastAnimateStyle, contentStyle]}>
      <Text style={[styles.toastText, toastTextStyle]}>{toastMessage}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    alignItems: "center",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  // eslint-disable-next-line react-native/no-color-literals
  toastText: {
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: "center",
  },
});

export default NetworkStatusToast;
