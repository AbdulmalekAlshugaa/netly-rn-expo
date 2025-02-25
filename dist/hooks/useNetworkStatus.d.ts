export declare enum NetworkStatus {
    NO_CONNECTION = "No Connection",
    CONNECTED = "Connected",
    SLOW_CONNECTION = "Slow Connection"
}
declare const useNetworkStatus: () => [NetworkStatus, NetworkStatus | undefined];
export default useNetworkStatus;
