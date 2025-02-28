import { NetworkStatus } from "../constants/NetLy";
type UseNetworkStatusProps = {
    slowConnectionDuration?: number;
    debug?: boolean;
    fetchFn?: typeof fetch;
    getAppState?: () => string;
};
declare const useNetworkStatus: ({ slowConnectionDuration, debug, fetchFn, getAppState, }?: UseNetworkStatusProps) => [NetworkStatus, NetworkStatus | undefined];
export default useNetworkStatus;
