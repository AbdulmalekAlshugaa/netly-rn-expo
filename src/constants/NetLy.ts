export enum NetworkStatus {
    NO_CONNECTION = 'No Connection',
    CONNECTED = 'Connected',
    SLOW_CONNECTION = 'Slow Connection',
}

export const connectionMessages = {
    NO_CONNECTION: 'You are offline',
    CONNECTED: 'Back online',
    SLOW_CONNECTION: 'Slow connection detected',
};

/**
 * Default endpoint probed to measure latency. Returns an empty 204 response.
 * Override via the `pingUrl` option in regions where Google is unreachable.
 */
export const DEFAULT_PING_URL = 'https://clients3.google.com/generate_204';

export const DEFAULT_POLL_INTERVAL = 10000;
export const DEFAULT_SLOW_THRESHOLD = 2000;
export const DEFAULT_SLOW_SAMPLE_COUNT = 2;
