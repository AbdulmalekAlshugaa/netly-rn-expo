import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import useNetworkStatus, {
  UseNetworkStatusOptions,
} from "../hooks/useNetworkStatus";
import { connectionMessages, NetworkStatus } from "../constants/NetLy";

export interface ToastRenderProps {
  status: NetworkStatus;
  message: string;
  color: string;
  dismiss: () => void;
}

export interface NetworkStatusToastProps
  extends Pick<
    UseNetworkStatusOptions,
    | "pollInterval"
    | "slowThreshold"
    | "slowSampleCount"
    | "pingUrl"
    | "debug"
    | "onStatusChange"
  > {
  /** Where the toast slides in from. Default: 'top'. */
  position?: "top" | "bottom";
  /**
   * Distance reserved for the status bar / notch when `position="top"`.
   * Default: a platform heuristic. For exact insets pass
   * `useSafeAreaInsets().top` from react-native-safe-area-context.
   */
  topOffset?: number;
  /** Distance from the bottom edge when `position="bottom"`. Default: 0. */
  bottomOffset?: number;
  /** Height of the toast content (excluding the offset). Default: 56. */
  toastHeight?: number;
  connectedColor?: string;
  disconnectedColor?: string;
  slowConnectionColor?: string;
  messageConnected?: string;
  messageNoConnection?: string;
  messageSlowConnection?: string;
  /** Set false to never show slow-connection toasts. Default: true. */
  showSlowConnection?: boolean;
  /** Slide animation duration in ms. Default: 300. */
  animationDuration?: number;
  /**
   * Auto-dismiss delay (ms) for the "back online" and "slow connection"
   * toasts. The offline toast persists until the connection is restored.
   * Default: 3000.
   */
  dismissTimeout?: number;
  contentStyle?: StyleProp<ViewStyle>;
  toastTextStyle?: StyleProp<TextStyle>;
  /** Replace the default text content; the animated shell is kept. */
  renderToast?: (props: ToastRenderProps) => React.ReactNode;
  /** Announce status changes to screen readers. Default: true. */
  announceForAccessibility?: boolean;
}

const defaultTopOffset = () =>
  Platform.OS === "ios" ? 59 : StatusBar.currentHeight ?? 24;

const NetworkStatusToast: React.FC<NetworkStatusToastProps> = ({
  position = "top",
  topOffset,
  bottomOffset = 0,
  toastHeight = 56,
  connectedColor = "#4CAF50",
  disconnectedColor = "#F44336",
  slowConnectionColor = "#FFC107",
  messageConnected = connectionMessages.CONNECTED,
  messageNoConnection = connectionMessages.NO_CONNECTION,
  messageSlowConnection = connectionMessages.SLOW_CONNECTION,
  showSlowConnection = true,
  animationDuration = 300,
  dismissTimeout = 3000,
  contentStyle,
  toastTextStyle,
  renderToast,
  announceForAccessibility = true,
  pollInterval,
  slowThreshold,
  slowSampleCount,
  pingUrl,
  debug,
  onStatusChange,
}) => {
  const { status, prevStatus } = useNetworkStatus({
    pollInterval,
    slowThreshold,
    slowSampleCount,
    pingUrl,
    debug,
    onStatusChange,
  });

  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState(connectedColor);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const offset = position === "top" ? topOffset ?? defaultTopOffset() : bottomOffset;
  const containerHeight = toastHeight + offset;

  const dismiss = useCallback(() => {
    if (!mountedRef.current) return;
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        mountedRef.current = false;
        setMounted(false);
      }
    });
  }, [animatedValue, animationDuration]);

  const show = useCallback(
    (message: string, color: string) => {
      setToastMessage(message);
      setToastColor(color);
      mountedRef.current = true;
      setMounted(true);
      if (announceForAccessibility) {
        AccessibilityInfo.announceForAccessibility?.(message);
      }
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    },
    [animatedValue, animationDuration, announceForAccessibility]
  );

  useEffect(() => {
    if (status === prevStatus) return;

    // Offline: show and persist until the connection comes back.
    if (status === NetworkStatus.NO_CONNECTION) {
      show(messageNoConnection, disconnectedColor);
      return;
    }

    // Slow: show on any transition into the slow state, then auto-dismiss.
    if (status === NetworkStatus.SLOW_CONNECTION) {
      if (!showSlowConnection) {
        dismiss();
        return;
      }
      show(messageSlowConnection, slowConnectionColor);
      const timeout = setTimeout(dismiss, dismissTimeout);
      return () => clearTimeout(timeout);
    }

    // Connected: announce recovery only after a real outage, then dismiss.
    if (prevStatus === NetworkStatus.NO_CONNECTION) {
      show(messageConnected, connectedColor);
    }
    const timeout = setTimeout(dismiss, dismissTimeout);
    return () => clearTimeout(timeout);
  }, [status]);

  if (!mounted) {
    return null;
  }

  const hiddenTranslate =
    position === "top" ? -containerHeight : containerHeight;
  const toastAnimatedStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [hiddenTranslate, 0],
        }),
      },
    ],
    opacity: animatedValue,
  };
  const placementStyle: ViewStyle =
    position === "top"
      ? { top: 0, paddingTop: offset }
      : { bottom: 0, paddingBottom: offset };

  return (
    <Animated.View
      pointerEvents="box-none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        placementStyle,
        { height: containerHeight, backgroundColor: toastColor },
        toastAnimatedStyle,
        contentStyle,
      ]}
    >
      {renderToast ? (
        renderToast({ status, message: toastMessage, color: toastColor, dismiss })
      ) : (
        <Text style={[styles.toastText, toastTextStyle]}>{toastMessage}</Text>
      )}
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
