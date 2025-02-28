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
var useNetworkStatus = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.slowConnectionDuration, slowConnectionDuration = _c === void 0 ? 30000 : _c, _d = _b.debug, debug = _d === void 0 ? false : _d, _e = _b.fetchFn, fetchFn = _e === void 0 ? fetch : _e, _f = _b.getAppState, getAppState = _f === void 0 ? function () { return react_native_1.AppState.currentState; } : _f;
    var netInfo = (0, netinfo_1.useNetInfo)();
    var _g = (0, react_1.useState)(NetLy_1.NetworkStatus.CONNECTED), networkState = _g[0], setNetworkState = _g[1];
    var prevState = (0, usePreviousValue_1.default)(networkState);
    var _h = (0, react_1.useState)(0), servicePortalDuration = _h[0], setServicePortalDuration = _h[1];
    var intervalId = (0, react_1.useRef)(undefined);
    var log = (0, react_1.useCallback)(function (message) {
        if (debug)
            console.log(message);
    }, [debug]);
    var transitionState = (0, react_1.useCallback)(function (newState) {
        if (newState !== networkState) {
            log("State Transition: ".concat(networkState, " -> ").concat(newState));
            setNetworkState(newState);
        }
    }, [networkState, log]);
    // Handle network state changes
    (0, react_1.useEffect)(function () {
        if (netInfo.type === "unknown")
            return;
        if (!netInfo.isConnected) {
            transitionState(NetLy_1.NetworkStatus.NO_CONNECTION);
        }
        else if (servicePortalDuration >= slowConnectionDuration) {
            transitionState(NetLy_1.NetworkStatus.SLOW_CONNECTION);
        }
        else {
            transitionState(NetLy_1.NetworkStatus.CONNECTED);
        }
    }, [netInfo.isConnected, servicePortalDuration, slowConnectionDuration, transitionState]);
    var cleanupPoll = function () {
        if (intervalId.current) {
            clearInterval(intervalId.current);
            intervalId.current = undefined;
        }
    };
    var pollNetworkStatus = (0, react_1.useCallback)(function () {
        if (getAppState() !== "active") {
            log("Skipping poll, app is in background");
            return;
        }
        var requestStartTime = Date.now();
        log("Start poll request");
        fetchFn("https://clients3.google.com/generate_204", {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        })
            .then(function (response) {
            if (getAppState() !== "active") {
                log("Poll result ignored due to app in background");
                return;
            }
            var requestDuration = Date.now() - requestStartTime;
            if (response.status === 204) {
                log("Poll success, duration: ".concat(requestDuration, "ms"));
                setServicePortalDuration(requestDuration);
            }
            else {
                log("Poll failed with status: ".concat(response.status));
                setServicePortalDuration(Infinity);
            }
        })
            .catch(function () {
            log("Poll error-ed out");
            setServicePortalDuration(Infinity);
        });
    }, [fetchFn, getAppState, log]);
    (0, react_1.useEffect)(function () {
        if (networkState === NetLy_1.NetworkStatus.NO_CONNECTION ||
            intervalId.current !== undefined) {
            cleanupPoll();
            return;
        }
        log("Scheduling poll");
        intervalId.current = setInterval(pollNetworkStatus, slowConnectionDuration);
        return cleanupPoll;
    }, [networkState, slowConnectionDuration, pollNetworkStatus]);
    return [networkState, prevState];
};
exports.default = useNetworkStatus;
