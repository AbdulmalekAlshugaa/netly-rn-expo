import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  InteractionManager,
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
  renderContent?: (networkState: NetworkStatus) => React.ReactNode; // Custom render prop
  debug?: boolean;
}

const NetworkStatusToast: React.FC<NetworkStatusToastProps> = ({
  disconnectedColor = "#F44336",
  connectedColor = "#4CAF50",
  slowConnectionColor = "#FFC107",
  toastHeight = 80,
  animationDuration = 400,
  dismissTimeout = 3000,
  renderContent, // Consumer can pass a custom UI
  debug = false,
}) => {
  const [networkState, prevNetworkState] = useNetworkStatus({ debug });
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState(connectedColor);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (networkState !== prevNetworkState) {
      let color = connectedColor;
      if (networkState === NetworkStatus.NO_CONNECTION) color = disconnectedColor;
      else if (networkState === NetworkStatus.SLOW_CONNECTION) color = slowConnectionColor;

      setToastColor(color);
      show();
    }

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
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", toastColor],
    }),
  };

  if (!showToast) {
    return null;
  }

  return (
    <Animated.View style={[styles.toast, toastAnimateStyle]}>
      {renderContent ? renderContent(networkState) : <DefaultToastContent networkState={networkState} />}
    </Animated.View>
  );
};

// Default content if `renderContent` is not provided
const DefaultToastContent: React.FC<{ networkState: NetworkStatus }> = ({ networkState }) => {
  let message = connectionMessages.CONNECTED;
  if (networkState === NetworkStatus.NO_CONNECTION) message = connectionMessages.NO_CONNECTION;
  else if (networkState === NetworkStatus.SLOW_CONNECTION) message = connectionMessages.SLOW_CONNECTION;

  return (
    <View style={styles.defaultContent}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
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
  defaultContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 16,
    textAlign: "center",
  },
});

export default NetworkStatusToast;
