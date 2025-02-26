import React from "react";
import { Text, View } from "react-native";
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
declare const NetworkStatusToast: React.FC<NetworkStatusToastProps>;
export default NetworkStatusToast;
