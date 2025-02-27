import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import usePreviousValue from "./usePreviousValue";
import { NetworkStatus } from "../constants/NetLy";

const useNetworkStatus = ({
  slowConnectionDuration = 30000,
  debug = false,
}: { slowConnectionDuration?: number; debug?: boolean } = {}): [
  NetworkStatus,
  NetworkStatus | undefined
] => {
  const netInfo = useNetInfo();

  const [networkState, setNetworkState] = useState(NetworkStatus.CONNECTED);
  const prevState = usePreviousValue(networkState);
  const [servicePortalDuration, setServicePortalDuration] = useState(0);

  const SLOW_CONNECTION_DETECTED_DURATION = 30000;

  const logStateTransition = (
    fromState: NetworkStatus,
    toState: NetworkStatus
  ) => {
    if (debug) {
      console.log(`State Transition: ${fromState} -> ${toState}`);
    }
  };

  const logPollCheckpoints = (message: string) => {
    if (debug) {
      console.log(`Poll Checkpoint: ${message}`);
    }
  };

  useEffect(() => {
    if (netInfo.type !== "unknown") {
      if (networkState === NetworkStatus.NO_CONNECTION) {
        if (netInfo.isConnected) {
          logStateTransition(
            NetworkStatus.NO_CONNECTION,
            NetworkStatus.CONNECTED
          );
          setNetworkState(NetworkStatus.CONNECTED);
        }
      } else if (networkState === NetworkStatus.CONNECTED) {
        if (!netInfo.isConnected) {
          logStateTransition(
            NetworkStatus.CONNECTED,
            NetworkStatus.NO_CONNECTION
          );
          setNetworkState(NetworkStatus.NO_CONNECTION);
        } else if (servicePortalDuration >= SLOW_CONNECTION_DETECTED_DURATION) {
          logStateTransition(
            NetworkStatus.CONNECTED,
            NetworkStatus.SLOW_CONNECTION
          );
          setNetworkState(NetworkStatus.SLOW_CONNECTION);
        }
      } else if (networkState === NetworkStatus.SLOW_CONNECTION) {
        if (!netInfo.isConnected) {
          logStateTransition(
            NetworkStatus.SLOW_CONNECTION,
            NetworkStatus.NO_CONNECTION
          );
          setNetworkState(NetworkStatus.NO_CONNECTION);
        } else if (servicePortalDuration < SLOW_CONNECTION_DETECTED_DURATION) {
          logStateTransition(
            NetworkStatus.SLOW_CONNECTION,
            NetworkStatus.CONNECTED
          );
          setNetworkState(NetworkStatus.CONNECTED);
        }
      }
    }
  }, [netInfo, servicePortalDuration]);

  const intervalId = useRef<NodeJS.Timeout | undefined>(undefined);

  const cleanupPoll = () => {
    if (intervalId.current !== undefined) {
      clearInterval(intervalId.current!);
      intervalId.current = undefined;
    }
  };

  // Measure the time it takes to reach the service portal
  useEffect(() => {
    if (
      networkState !== NetworkStatus.CONNECTED &&
      networkState !== NetworkStatus.SLOW_CONNECTION
    ) {
      logPollCheckpoints("Clear poll due to no connection");
      cleanupPoll();
      return;
    }

    // Skip scheduling if already polling
    if (intervalId.current !== undefined) {
      logPollCheckpoints("Skip scheduling poll");
      return;
    }

    logPollCheckpoints("Scheduling poll");

    const pollNetworkStatus = () => {
      if (AppState.currentState !== "active") {
        logPollCheckpoints("Skipping poll, app is in background");
        return;
      }

      const requestStartTime = Date.now();
      logPollCheckpoints(`Start poll request`);

      fetch("https://clients3.google.com/generate_204", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
        .then((response) => {
          if (AppState.currentState !== "active") {
            logPollCheckpoints("Poll result ignored due to app in background");
            return;
          }

          if (
            response.status === 204 &&
            (networkState === NetworkStatus.CONNECTED ||
              networkState === NetworkStatus.SLOW_CONNECTION)
          ) {
            const requestDuration = Date.now() - requestStartTime;
            logPollCheckpoints(`Poll success, duration: ${requestDuration}ms`);
            setServicePortalDuration(requestDuration);
          } else {
            logPollCheckpoints(
              `Poll failed with status: ${response.status} and network status: ${networkState}`
            );
            setServicePortalDuration(Infinity);
          }
        })
        .catch(() => {
          logPollCheckpoints("Poll error-ed out");
          setServicePortalDuration(Infinity);
        });
    };

    intervalId.current = setInterval(pollNetworkStatus, slowConnectionDuration);

    return () => {
      logPollCheckpoints("Clear poll due to render");
      cleanupPoll();
    };
  }, [networkState]);

  return [networkState, prevState];
};

export default useNetworkStatus;
