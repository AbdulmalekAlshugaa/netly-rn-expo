import React from "react";
import { NetworkStatus } from "../constants/NetLy";
interface NetworkStatusToastProps {
    disconnectedColor?: string;
    connectedColor?: string;
    slowConnectionColor?: string;
    toastHeight?: number;
    animationDuration?: number;
    dismissTimeout?: number;
    renderContent?: (networkState: NetworkStatus) => React.ReactNode;
    debug?: boolean;
}
declare const NetworkStatusToast: React.FC<NetworkStatusToastProps>;
export default NetworkStatusToast;
