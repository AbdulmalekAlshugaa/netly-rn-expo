import { NetworkStatus } from "../constants/NetLy";
declare const useNetworkStatus: ({ debug }?: {
    debug?: boolean;
}) => [NetworkStatus, NetworkStatus | undefined];
export default useNetworkStatus;
