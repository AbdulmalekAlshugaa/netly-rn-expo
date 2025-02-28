import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import usePreviousValue from "./usePreviousValue";
import { NetworkStatus } from "../constants/NetLy";

type UseNetworkStatusProps = {
  slowConnectionDuration?: number;
  debug?: boolean;
  fetchFn?: typeof fetch;
  getAppState?: () => string;
};

const useNetworkStatus = ({
  slowConnectionDuration = 30000,
  debug = false,
  fetchFn = fetch,
  getAppState = () => AppState.currentState,
}: UseNetworkStatusProps = {
  
}): [NetworkStatus, NetworkStatus | undefined] => {
  const netInfo = useNetInfo();
  const [networkState, setNetworkState] = useState(NetworkStatus.CONNECTED);
  const prevState = usePreviousValue(networkState);
  const [servicePortalDuration, setServicePortalDuration] = useState(0);
  
  const intervalId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const log = useCallback((message: string) => {
    if (debug) console.log(message);
  }, [debug]);

  const transitionState = useCallback(
    (newState: NetworkStatus) => {
      if (newState !== networkState) {
        log(`State Transition: ${networkState} -> ${newState}`);
        setNetworkState(newState);
      }
    },
    [networkState, log]
  );

  // Handle network state changes
  useEffect(() => {
    if (netInfo.type === "unknown") return;

    if (!netInfo.isConnected) {
      transitionState(NetworkStatus.NO_CONNECTION);
    } else if (servicePortalDuration >= slowConnectionDuration) {
      transitionState(NetworkStatus.SLOW_CONNECTION);
    } else {
      transitionState(NetworkStatus.CONNECTED);
    }
  }, [netInfo.isConnected, servicePortalDuration, slowConnectionDuration, transitionState]);

  const cleanupPoll = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  };

  const pollNetworkStatus = useCallback(() => {
    if (getAppState() !== "active") {
      log("Skipping poll, app is in background");
      return;
    }

    const requestStartTime = Date.now();
    log("Start poll request");

    fetchFn("https://clients3.google.com/generate_204", {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
      .then((response) => {
        if (getAppState() !== "active") {
          log("Poll result ignored due to app in background");
          return;
        }

        const requestDuration = Date.now() - requestStartTime;
        if (response.status === 204) {
          log(`Poll success, duration: ${requestDuration}ms`);
          setServicePortalDuration(requestDuration);
        } else {
          log(`Poll failed with status: ${response.status}`);
          setServicePortalDuration(Infinity);
        }
      })
      .catch(() => {
        log("Poll error-ed out");
        setServicePortalDuration(Infinity);
      });
  }, [fetchFn, getAppState, log]);

  useEffect(() => {
    if (
      networkState === NetworkStatus.NO_CONNECTION ||
      intervalId.current !== undefined
    ) {
      cleanupPoll();
      return;
    }

    log("Scheduling poll");
    intervalId.current = setInterval(pollNetworkStatus, slowConnectionDuration);

    return cleanupPoll;
  }, [networkState, slowConnectionDuration, pollNetworkStatus]);

  return [networkState, prevState];
};

export default useNetworkStatus;
