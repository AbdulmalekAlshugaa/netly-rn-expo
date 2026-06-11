"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var useNetworkStatus_1 = __importDefault(require("../hooks/useNetworkStatus"));
var NetLy_1 = require("../constants/NetLy");
var defaultTopOffset = function () { var _a; return react_native_1.Platform.OS === "ios" ? 59 : (_a = react_native_1.StatusBar.currentHeight) !== null && _a !== void 0 ? _a : 24; };
var NetworkStatusToast = function (_a) {
    var _b = _a.position, position = _b === void 0 ? "top" : _b, topOffset = _a.topOffset, _c = _a.bottomOffset, bottomOffset = _c === void 0 ? 0 : _c, _d = _a.toastHeight, toastHeight = _d === void 0 ? 56 : _d, _e = _a.connectedColor, connectedColor = _e === void 0 ? "#4CAF50" : _e, _f = _a.disconnectedColor, disconnectedColor = _f === void 0 ? "#F44336" : _f, _g = _a.slowConnectionColor, slowConnectionColor = _g === void 0 ? "#FFC107" : _g, _h = _a.messageConnected, messageConnected = _h === void 0 ? NetLy_1.connectionMessages.CONNECTED : _h, _j = _a.messageNoConnection, messageNoConnection = _j === void 0 ? NetLy_1.connectionMessages.NO_CONNECTION : _j, _k = _a.messageSlowConnection, messageSlowConnection = _k === void 0 ? NetLy_1.connectionMessages.SLOW_CONNECTION : _k, _l = _a.showSlowConnection, showSlowConnection = _l === void 0 ? true : _l, _m = _a.animationDuration, animationDuration = _m === void 0 ? 300 : _m, _o = _a.dismissTimeout, dismissTimeout = _o === void 0 ? 3000 : _o, contentStyle = _a.contentStyle, toastTextStyle = _a.toastTextStyle, renderToast = _a.renderToast, _p = _a.announceForAccessibility, announceForAccessibility = _p === void 0 ? true : _p, pollInterval = _a.pollInterval, slowThreshold = _a.slowThreshold, slowSampleCount = _a.slowSampleCount, pingUrl = _a.pingUrl, debug = _a.debug, onStatusChange = _a.onStatusChange;
    var _q = (0, useNetworkStatus_1.default)({
        pollInterval: pollInterval,
        slowThreshold: slowThreshold,
        slowSampleCount: slowSampleCount,
        pingUrl: pingUrl,
        debug: debug,
        onStatusChange: onStatusChange,
    }), status = _q.status, prevStatus = _q.prevStatus;
    var _r = (0, react_1.useState)(false), mounted = _r[0], setMounted = _r[1];
    var mountedRef = (0, react_1.useRef)(false);
    var _s = (0, react_1.useState)(""), toastMessage = _s[0], setToastMessage = _s[1];
    var _t = (0, react_1.useState)(connectedColor), toastColor = _t[0], setToastColor = _t[1];
    var animatedValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var offset = position === "top" ? topOffset !== null && topOffset !== void 0 ? topOffset : defaultTopOffset() : bottomOffset;
    var containerHeight = toastHeight + offset;
    var dismiss = (0, react_1.useCallback)(function () {
        if (!mountedRef.current)
            return;
        react_native_1.Animated.timing(animatedValue, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
        }).start(function (_a) {
            var finished = _a.finished;
            if (finished) {
                mountedRef.current = false;
                setMounted(false);
            }
        });
    }, [animatedValue, animationDuration]);
    var show = (0, react_1.useCallback)(function (message, color) {
        var _a;
        setToastMessage(message);
        setToastColor(color);
        mountedRef.current = true;
        setMounted(true);
        if (announceForAccessibility) {
            (_a = react_native_1.AccessibilityInfo.announceForAccessibility) === null || _a === void 0 ? void 0 : _a.call(react_native_1.AccessibilityInfo, message);
        }
        react_native_1.Animated.timing(animatedValue, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
        }).start();
    }, [animatedValue, animationDuration, announceForAccessibility]);
    (0, react_1.useEffect)(function () {
        if (status === prevStatus)
            return;
        // Offline: show and persist until the connection comes back.
        if (status === NetLy_1.NetworkStatus.NO_CONNECTION) {
            show(messageNoConnection, disconnectedColor);
            return;
        }
        // Slow: show on any transition into the slow state, then auto-dismiss.
        if (status === NetLy_1.NetworkStatus.SLOW_CONNECTION) {
            if (!showSlowConnection) {
                dismiss();
                return;
            }
            show(messageSlowConnection, slowConnectionColor);
            var timeout_1 = setTimeout(dismiss, dismissTimeout);
            return function () { return clearTimeout(timeout_1); };
        }
        // Connected: announce recovery only after a real outage, then dismiss.
        if (prevStatus === NetLy_1.NetworkStatus.NO_CONNECTION) {
            show(messageConnected, connectedColor);
        }
        var timeout = setTimeout(dismiss, dismissTimeout);
        return function () { return clearTimeout(timeout); };
    }, [status]);
    if (!mounted) {
        return null;
    }
    var hiddenTranslate = position === "top" ? -containerHeight : containerHeight;
    var toastAnimatedStyle = {
        transform: [
            {
                translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [hiddenTranslate, 0],
                }),
            },
        ],
        opacity: animatedValue,
    };
    var placementStyle = position === "top"
        ? { top: 0, paddingTop: offset }
        : { bottom: 0, paddingBottom: offset };
    return (<react_native_1.Animated.View pointerEvents="box-none" accessibilityRole="alert" accessibilityLiveRegion="polite" style={[
            styles.toast,
            placementStyle,
            { height: containerHeight, backgroundColor: toastColor },
            toastAnimatedStyle,
            contentStyle,
        ]}>
      {renderToast ? (renderToast({ status: status, message: toastMessage, color: toastColor, dismiss: dismiss })) : (<react_native_1.Text style={[styles.toastText, toastTextStyle]}>{toastMessage}</react_native_1.Text>)}
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    toast: {
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        zIndex: 1000,
    },
    // eslint-disable-next-line react-native/no-color-literals
    toastText: {
        color: "#fff",
        fontSize: 14,
        paddingHorizontal: 16,
        textAlign: "center",
    },
});
exports.default = NetworkStatusToast;
