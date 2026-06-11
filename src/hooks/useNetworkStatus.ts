import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import usePreviousValue from "./usePreviousValue";
import {
  DEFAULT_PING_URL,
  DEFAULT_POLL_INTERVAL,
  DEFAULT_SLOW_SAMPLE_COUNT,
  DEFAULT_SLOW_THRESHOLD,
  NetworkStatus,
} from "../constants/NetLy";

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
  onStatusChange?: (
    status: NetworkStatus,
    prevStatus: NetworkStatus | undefined
  ) => void;
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

// Only pause when we know for sure the app left the foreground; any other
// value (including 'unknown' at startup) counts as active.
const isActiveState = (state: AppStateStatus | null) =>
  state !== "background" && state !== "inactive";

const useNetworkStatus = (
  options: UseNetworkStatusOptions = {}
): UseNetworkStatusResult => {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL,
    slowThreshold = DEFAULT_SLOW_THRESHOLD,
    slowSampleCount = DEFAULT_SLOW_SAMPLE_COUNT,
    pingUrl = DEFAULT_PING_URL,
    pingTimeout = Math.min(slowThreshold * 2, pollInterval),
    onStatusChange,
    debug = false,
    fetchFn = fetch,
  } = options;

  const netInfo = useNetInfo();
  const [status, setStatus] = useState(NetworkStatus.CONNECTED);
  const prevStatus = usePreviousValue(status);
  const [appActive, setAppActive] = useState(() =>
    isActiveState(AppState.currentState)
  );
  const [pollResult, setPollResult] = useState<"fast" | "slow" | null>(null);
  const slowSamplesRef = useRef(0);

  // Latest probe configuration, read inside the probe so changing callbacks
  // or thresholds never tears down and restarts the polling interval.
  const probeOptsRef = useRef({
    slowThreshold,
    slowSampleCount,
    pingUrl,
    pingTimeout,
    fetchFn,
    debug,
  });
  useEffect(() => {
    probeOptsRef.current = {
      slowThreshold,
      slowSampleCount,
      pingUrl,
      pingTimeout,
      fetchFn,
      debug,
    };
  });

  // Effect A: track foreground/background so polling pauses in the background.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppActive(isActiveState(state));
    });
    return () => subscription?.remove?.();
  }, []);

  // Effect B: latency polling. The interval is created and cleared by the
  // same effect run, so it can never leak or silently die on dep changes.
  // Coming back online or returning to the foreground re-runs the effect,
  // which fires an immediate probe before resuming the interval.
  useEffect(() => {
    if (netInfo.isConnected !== true || !appActive) {
      slowSamplesRef.current = 0;
      return;
    }

    let cancelled = false;
    let controller: AbortController | undefined;

    const probe = async () => {
      const opts = probeOptsRef.current;
      const log = (message: string) => {
        if (opts.debug) console.log(`[netly-rn-expo] ${message}`);
      };

      controller =
        typeof AbortController !== "undefined" ? new AbortController() : undefined;
      const timeoutId = controller
        ? setTimeout(() => controller?.abort(), opts.pingTimeout)
        : undefined;
      const start = Date.now();

      try {
        const response = await opts.fetchFn(opts.pingUrl, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          signal: controller?.signal,
        });
        const duration = Date.now() - start;
        const ok = response.status >= 200 && response.status < 300;
        if (ok && duration <= opts.slowThreshold) {
          log(`Probe ok in ${duration}ms`);
          slowSamplesRef.current = 0;
        } else {
          log(
            ok
              ? `Probe slow: ${duration}ms`
              : `Probe failed with status ${response.status}`
          );
          slowSamplesRef.current += 1;
        }
      } catch {
        log("Probe errored or timed out");
        slowSamplesRef.current += 1;
      } finally {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      }

      if (!cancelled) {
        setPollResult(
          slowSamplesRef.current >= probeOptsRef.current.slowSampleCount
            ? "slow"
            : "fast"
        );
      }
    };

    probe();
    const id = setInterval(probe, pollInterval);

    return () => {
      cancelled = true;
      controller?.abort();
      clearInterval(id);
    };
  }, [netInfo.isConnected, appActive, pollInterval]);

  // Effect C: derive the public status from connectivity + probe results.
  useEffect(() => {
    if (netInfo.type === "unknown") return;

    if (!netInfo.isConnected) {
      slowSamplesRef.current = 0;
      setPollResult(null);
      setStatus(NetworkStatus.NO_CONNECTION);
    } else if (pollResult === "slow") {
      setStatus(NetworkStatus.SLOW_CONNECTION);
    } else {
      setStatus(NetworkStatus.CONNECTED);
    }
  }, [netInfo.isConnected, netInfo.type, pollResult]);

  // Effect D: notify on transitions (never on mount or unrelated re-renders).
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  });
  const lastReportedRef = useRef<NetworkStatus>(status);
  useEffect(() => {
    if (lastReportedRef.current === status) return;
    const prev = lastReportedRef.current;
    lastReportedRef.current = status;
    if (probeOptsRef.current.debug) {
      console.log(`[netly-rn-expo] State transition: ${prev} -> ${status}`);
    }
    onStatusChangeRef.current?.(status, prev);
  }, [status]);

  return {
    status,
    prevStatus,
    isConnected: status !== NetworkStatus.NO_CONNECTION,
    isSlow: status === NetworkStatus.SLOW_CONNECTION,
  };
};

export default useNetworkStatus;
