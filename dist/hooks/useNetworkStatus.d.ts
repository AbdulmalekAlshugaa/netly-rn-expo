import { NetworkStatus } from "../constants/NetLy";
declare const useNetworkStatus: ({ slowConnectionDuration, debug, }?: {
    slowConnectionDuration?: number;
    debug?: boolean;
}) => [NetworkStatus, NetworkStatus | undefined];
export default useNetworkStatus;
