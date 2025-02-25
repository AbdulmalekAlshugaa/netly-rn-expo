import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import usePreviousValue from './usePreviousValue';

export enum NetworkStatus {
    NO_CONNECTION = 'No Connection',
    CONNECTED = 'Connected',
    SLOW_CONNECTION = 'Slow Connection',
}

const DEBUG_NETWORK_STATUS_STATE_MACHINE = false;

const SLOW_CONNECTION_POLL_DURATION = 30000;

const useNetworkStatus = (): [NetworkStatus, NetworkStatus | undefined] => {
    const netInfo = useNetInfo();

    const [networkState, setNetworkState] = useState(NetworkStatus.CONNECTED);
    const prevState = usePreviousValue(networkState);
    const [servicePortalDuration, setServicePortalDuration] = useState(0);

    const SLOW_CONNECTION_DETECTED_DURATION = 30000;

    const logStateTransition = (fromState: NetworkStatus, toState: NetworkStatus) => {
        if (DEBUG_NETWORK_STATUS_STATE_MACHINE) {
            console.log(`State Transition: ${fromState} -> ${toState}`);
        }
    };

    const logPollCheckpoints = (message: string) => {
        if (DEBUG_NETWORK_STATUS_STATE_MACHINE) {
            console.log(`Poll Checkpoint: ${message}`);
        }
    };

    useEffect(() => {
        if (netInfo.type !== 'unknown') {
            if (networkState === NetworkStatus.NO_CONNECTION) {
                if (netInfo.isConnected) {
                    logStateTransition(NetworkStatus.NO_CONNECTION, NetworkStatus.CONNECTED);
                    setNetworkState(NetworkStatus.CONNECTED);
                }
            } else if (networkState === NetworkStatus.CONNECTED) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetworkStatus.CONNECTED, NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetworkStatus.NO_CONNECTION);
                } else if (servicePortalDuration >= SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetworkStatus.CONNECTED, NetworkStatus.SLOW_CONNECTION);
                    setNetworkState(NetworkStatus.SLOW_CONNECTION);
                }
            } else if (networkState === NetworkStatus.SLOW_CONNECTION) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetworkStatus.SLOW_CONNECTION, NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetworkStatus.NO_CONNECTION);
                } else if (servicePortalDuration < SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetworkStatus.SLOW_CONNECTION, NetworkStatus.CONNECTED);
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
        if (networkState === NetworkStatus.CONNECTED || networkState === NetworkStatus.SLOW_CONNECTION) {
            // skip if the network check is already active
            if (intervalId.current !== undefined) {
                logPollCheckpoints('Skip scheduling poll');
                return;
            }

            logPollCheckpoints('Scheduling poll');
            intervalId.current = setInterval(() => {
                // Do not have to poll when app is not in foreground
                if (AppState.currentState === 'active') {
                    const requestStartTime = Date.now();
                    logPollCheckpoints(`Start poll request`);
                    fetch('https://clients3.google.com/generate_204', {
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            Pragma: 'no-cache',
                            Expires: '0',
                        },
                    })
                        .then(response => {
                            // Since it is a promise, request can be started before app go into background but response received when the app is in background state
                            // TODO: verify if the callback actually gets called when the app is in background
                            if (AppState.currentState === 'active') {
                                // Since it is a promise, networkState can change in between the request, important to guard this again
                                if (
                                    response.status === 204 &&
                                    (networkState === NetworkStatus.CONNECTED ||
                                        networkState === NetworkStatus.SLOW_CONNECTION)
                                ) {
                                    const requestEndtime = Date.now();
                                    const requestDuration = requestEndtime - requestStartTime;
                                    logPollCheckpoints(`Poll success, duration: ${requestDuration}ms`);
                                    setServicePortalDuration(requestDuration);
                                } else {
                                    logPollCheckpoints(
                                        `Poll failed with status: ${response.status} and network status: ${networkState}`,
                                    );
                                    setServicePortalDuration(Infinity);
                                }
                            } else {
                                logPollCheckpoints('Poll result ignored due to app in background');
                            }
                        })
                        .catch(() => {
                            logPollCheckpoints('Poll error-ed out');
                            setServicePortalDuration(Infinity);
                        });
                }
            }, SLOW_CONNECTION_POLL_DURATION);
        } else if (networkState === NetworkStatus.NO_CONNECTION) {
            logPollCheckpoints('Clear poll due to no connection');
            // if no connection, dont have to poll
            cleanupPoll();
        }

        return () => {
            logPollCheckpoints('Clear poll due to render');
            cleanupPoll();
        };
    }, [networkState]);

    return [networkState, prevState];
};

export default useNetworkStatus;
