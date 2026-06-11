import { NetworkStatus } from "../constants/NetLy";
export interface UseNetworkStatusOptions {
    /** Milliseconds between latency probes. Default: 10000. */
    pollInterval?: number;
    /** A probe slower than this (ms) counts as one slow sample. Default: 2000. */
    slowThreshold?: number;
    /**
     * Consecutive slow samples required before reporting SLOW_CONNECTION.
     * A single fast sample exits the slow state. Default: 2.
     */
    slowSampleCount?: number;
    /** URL probed for latency. Must answer fast with a 2xx status. Default: Google generate_204. */
    pingUrl?: string;
    /**
     * Abort a probe after this many ms; a timeout counts as a slow sample.
     * Default: min(slowThreshold * 2, pollInterval).
     */
    pingTimeout?: number;
    /** Called once per status transition. */
    onStatusChange?: (status: NetworkStatus, prevStatus: NetworkStatus | undefined) => void;
    /** Log probe results and state transitions to the console. */
    debug?: boolean;
    /** Injectable fetch implementation (test seam). */
    fetchFn?: typeof fetch;
}
export interface UseNetworkStatusResult {
    status: NetworkStatus;
    prevStatus: NetworkStatus | undefined;
    /** `status !== NO_CONNECTION` */
    isConnected: boolean;
    /** `status === SLOW_CONNECTION` */
    isSlow: boolean;
}
declare const useNetworkStatus: (options?: UseNetworkStatusOptions) => UseNetworkStatusResult;
export default useNetworkStatus;
