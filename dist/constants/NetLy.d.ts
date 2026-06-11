export declare enum NetworkStatus {
    NO_CONNECTION = "No Connection",
    CONNECTED = "Connected",
    SLOW_CONNECTION = "Slow Connection"
}
export declare const connectionMessages: {
    NO_CONNECTION: string;
    CONNECTED: string;
    SLOW_CONNECTION: string;
};
/**
 * Default endpoint probed to measure latency. Returns an empty 204 response.
 * Override via the `pingUrl` option in regions where Google is unreachable.
 */
export declare const DEFAULT_PING_URL = "https://clients3.google.com/generate_204";
export declare const DEFAULT_POLL_INTERVAL = 10000;
export declare const DEFAULT_SLOW_THRESHOLD = 2000;
export declare const DEFAULT_SLOW_SAMPLE_COUNT = 2;
