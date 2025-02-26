"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var netinfo_1 = require("@react-native-community/netinfo");
var react_1 = require("react");
var react_native_1 = require("react-native");
var usePreviousValue_1 = __importDefault(require("./usePreviousValue"));
var NetLy_1 = require("../constants/NetLy");
var DEBUG_NETWORK_STATUS_STATE_MACHINE = false;
var SLOW_CONNECTION_POLL_DURATION = 30000;
var useNetworkStatus = function () {
    var netInfo = (0, netinfo_1.useNetInfo)();
    var _a = (0, react_1.useState)(NetLy_1.NetworkStatus.CONNECTED), networkState = _a[0], setNetworkState = _a[1];
    var prevState = (0, usePreviousValue_1.default)(networkState);
    var _b = (0, react_1.useState)(0), servicePortalDuration = _b[0], setServicePortalDuration = _b[1];
    var SLOW_CONNECTION_DETECTED_DURATION = 30000;
    var logStateTransition = function (fromState, toState) {
        if (DEBUG_NETWORK_STATUS_STATE_MACHINE) {
            console.log("State Transition: ".concat(fromState, " -> ").concat(toState));
        }
    };
    var logPollCheckpoints = function (message) {
        if (DEBUG_NETWORK_STATUS_STATE_MACHINE) {
            console.log("Poll Checkpoint: ".concat(message));
        }
    };
    (0, react_1.useEffect)(function () {
        if (netInfo.type !== 'unknown') {
            if (networkState === NetLy_1.NetworkStatus.NO_CONNECTION) {
                if (netInfo.isConnected) {
                    logStateTransition(NetLy_1.NetworkStatus.NO_CONNECTION, NetLy_1.NetworkStatus.CONNECTED);
                    setNetworkState(NetLy_1.NetworkStatus.CONNECTED);
                }
            }
            else if (networkState === NetLy_1.NetworkStatus.CONNECTED) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetLy_1.NetworkStatus.CONNECTED, NetLy_1.NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetLy_1.NetworkStatus.NO_CONNECTION);
                }
                else if (servicePortalDuration >= SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetLy_1.NetworkStatus.CONNECTED, NetLy_1.NetworkStatus.SLOW_CONNECTION);
                    setNetworkState(NetLy_1.NetworkStatus.SLOW_CONNECTION);
                }
            }
            else if (networkState === NetLy_1.NetworkStatus.SLOW_CONNECTION) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetLy_1.NetworkStatus.SLOW_CONNECTION, NetLy_1.NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetLy_1.NetworkStatus.NO_CONNECTION);
                }
                else if (servicePortalDuration < SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetLy_1.NetworkStatus.SLOW_CONNECTION, NetLy_1.NetworkStatus.CONNECTED);
                    setNetworkState(NetLy_1.NetworkStatus.CONNECTED);
                }
            }
        }
    }, [netInfo, servicePortalDuration]);
    var intervalId = (0, react_1.useRef)(undefined);
    var cleanupPoll = function () {
        if (intervalId.current !== undefined) {
            clearInterval(intervalId.current);
            intervalId.current = undefined;
        }
    };
    // Measure the time it takes to reach the service portal
    (0, react_1.useEffect)(function () {
        if (networkState !== NetLy_1.NetworkStatus.CONNECTED &&
            networkState !== NetLy_1.NetworkStatus.SLOW_CONNECTION) {
            logPollCheckpoints('Clear poll due to no connection');
            cleanupPoll();
            return;
        }
        // Skip scheduling if already polling
        if (intervalId.current !== undefined) {
            logPollCheckpoints('Skip scheduling poll');
            return;
        }
        logPollCheckpoints('Scheduling poll');
        var pollNetworkStatus = function () {
            if (react_native_1.AppState.currentState !== 'active') {
                logPollCheckpoints('Skipping poll, app is in background');
                return;
            }
            var requestStartTime = Date.now();
            logPollCheckpoints("Start poll request");
            fetch('https://clients3.google.com/generate_204', {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0',
                },
            })
                .then(function (response) {
                if (react_native_1.AppState.currentState !== 'active') {
                    logPollCheckpoints('Poll result ignored due to app in background');
                    return;
                }
                if (response.status === 204 &&
                    (networkState === NetLy_1.NetworkStatus.CONNECTED ||
                        networkState === NetLy_1.NetworkStatus.SLOW_CONNECTION)) {
                    var requestDuration = Date.now() - requestStartTime;
                    logPollCheckpoints("Poll success, duration: ".concat(requestDuration, "ms"));
                    setServicePortalDuration(requestDuration);
                }
                else {
                    logPollCheckpoints("Poll failed with status: ".concat(response.status, " and network status: ").concat(networkState));
                    setServicePortalDuration(Infinity);
                }
            })
                .catch(function () {
                logPollCheckpoints('Poll error-ed out');
                setServicePortalDuration(Infinity);
            });
        };
        intervalId.current = setInterval(pollNetworkStatus, SLOW_CONNECTION_POLL_DURATION);
        return function () {
            logPollCheckpoints('Clear poll due to render');
            cleanupPoll();
        };
    }, [networkState]);
    return [networkState, prevState];
};
exports.default = useNetworkStatus;
