import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { UseNetworkStatusOptions } from "../hooks/useNetworkStatus";
import { NetworkStatus } from "../constants/NetLy";
export interface ToastRenderProps {
    status: NetworkStatus;
    message: string;
    color: string;
    dismiss: () => void;
}
export interface NetworkStatusToastProps extends Pick<UseNetworkStatusOptions, "pollInterval" | "slowThreshold" | "slowSampleCount" | "pingUrl" | "debug" | "onStatusChange"> {
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
declare const NetworkStatusToast: React.FC<NetworkStatusToastProps>;
export default NetworkStatusToast;
