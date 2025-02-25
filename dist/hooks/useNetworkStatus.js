"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkStatus = void 0;
var netinfo_1 = require("@react-native-community/netinfo");
var react_1 = require("react");
var react_native_1 = require("react-native");
var usePreviousValue_1 = __importDefault(require("./usePreviousValue"));
var NetworkStatus;
(function (NetworkStatus) {
    NetworkStatus["NO_CONNECTION"] = "No Connection";
    NetworkStatus["CONNECTED"] = "Connected";
    NetworkStatus["SLOW_CONNECTION"] = "Slow Connection";
})(NetworkStatus || (exports.NetworkStatus = NetworkStatus = {}));
var DEBUG_NETWORK_STATUS_STATE_MACHINE = false;
var SLOW_CONNECTION_POLL_DURATION = 30000;
var useNetworkStatus = function () {
    var netInfo = (0, netinfo_1.useNetInfo)();
    var _a = (0, react_1.useState)(NetworkStatus.CONNECTED), networkState = _a[0], setNetworkState = _a[1];
    var prevState = (0, usePreviousValue_1.default)(networkState);
    var _b = (0, react_1.useState)(0), servicePortalDuration = _b[0], setServicePortalDuration = _b[1];
    var SLOW_CONNECTION_DETECTED_DURATION = 30000;
    var logStateTransition = function (fromState, toState) {
        console.log("Network State Transition: ".concat(fromState, " -> ").concat(toState, " (").concat(servicePortalDuration, "ms)"));
    };
    var logPollCheckpoints = function (message) {
        console.log("Poll Checkpoint: ".concat(message));
    };
    (0, react_1.useEffect)(function () {
        if (netInfo.type !== "unknown") {
            if (networkState === NetworkStatus.NO_CONNECTION) {
                if (netInfo.isConnected) {
                    logStateTransition(NetworkStatus.NO_CONNECTION, NetworkStatus.CONNECTED);
                    setNetworkState(NetworkStatus.CONNECTED);
                }
            }
            else if (networkState === NetworkStatus.CONNECTED) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetworkStatus.CONNECTED, NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetworkStatus.NO_CONNECTION);
                }
                else if (servicePortalDuration >= SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetworkStatus.CONNECTED, NetworkStatus.SLOW_CONNECTION);
                    setNetworkState(NetworkStatus.SLOW_CONNECTION);
                }
            }
            else if (networkState === NetworkStatus.SLOW_CONNECTION) {
                if (!netInfo.isConnected) {
                    logStateTransition(NetworkStatus.SLOW_CONNECTION, NetworkStatus.NO_CONNECTION);
                    setNetworkState(NetworkStatus.NO_CONNECTION);
                }
                else if (servicePortalDuration < SLOW_CONNECTION_DETECTED_DURATION) {
                    logStateTransition(NetworkStatus.SLOW_CONNECTION, NetworkStatus.CONNECTED);
                    setNetworkState(NetworkStatus.CONNECTED);
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
        if (networkState === NetworkStatus.CONNECTED ||
            networkState === NetworkStatus.SLOW_CONNECTION) {
            // skip if the network check is already active
            if (intervalId.current !== undefined) {
                logPollCheckpoints("Skip scheduling poll");
                return;
            }
            logPollCheckpoints("Scheduling poll");
            intervalId.current = setInterval(function () {
                // Do not have to poll when app is not in foreground
                if (react_native_1.AppState.currentState === "active") {
                    var requestStartTime_1 = Date.now();
                    logPollCheckpoints("Start poll request");
                    fetch("https://clients3.google.com/generate_204", {
                        headers: {
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            Expires: "0",
                        },
                    })
                        .then(function (response) {
                        // Since it is a promise, request can be started before app go into background but response received when the app is in background state
                        // TODO: verify if the callback actually gets called when the app is in background
                        if (react_native_1.AppState.currentState === "active") {
                            // Since it is a promise, networkState can change in between the request, important to guard this again
                            if (response.status === 204 &&
                                (networkState === NetworkStatus.CONNECTED ||
                                    networkState === NetworkStatus.SLOW_CONNECTION)) {
                                var requestEndtime = Date.now();
                                var requestDuration = requestEndtime - requestStartTime_1;
                                logPollCheckpoints("Poll success, duration: ".concat(requestDuration, "ms"));
                                setServicePortalDuration(requestDuration);
                            }
                            else {
                                logPollCheckpoints("Poll failed with status: ".concat(response.status, " and network status: ").concat(networkState));
                                setServicePortalDuration(Infinity);
                            }
                        }
                        else {
                            logPollCheckpoints("Poll result ignored due to app in background");
                        }
                    })
                        .catch(function () {
                        logPollCheckpoints("Poll error-ed out");
                        setServicePortalDuration(Infinity);
                    });
                }
            }, SLOW_CONNECTION_POLL_DURATION);
        }
        else if (networkState === NetworkStatus.NO_CONNECTION) {
            logPollCheckpoints("Clear poll due to no connection");
            // if no connection, dont have to poll
            cleanupPoll();
        }
        return function () {
            logPollCheckpoints("Clear poll due to render");
            cleanupPoll();
        };
    }, [networkState]);
    return [networkState, prevState];
};
exports.default = useNetworkStatus;
