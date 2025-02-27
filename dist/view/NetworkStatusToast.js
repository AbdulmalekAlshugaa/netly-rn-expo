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
var NetworkStatusToast = function (_a) {
    var _b = _a.disconnectedColor, disconnectedColor = _b === void 0 ? "#F44336" : _b, // Default Red
    _c = _a.connectedColor, // Default Red
    connectedColor = _c === void 0 ? "#4CAF50" : _c, // Default Green
    _d = _a.slowConnectionColor, // Default Green
    slowConnectionColor = _d === void 0 ? "#FFC107" : _d, // Default Yellow
    _e = _a.toastHeight, // Default Yellow
    toastHeight = _e === void 0 ? 80 : _e, _f = _a.animationDuration, animationDuration = _f === void 0 ? 400 : _f, _g = _a.dismissTimeout, dismissTimeout = _g === void 0 ? 3000 : _g, _h = _a.messageNoConnection, messageNoConnection = _h === void 0 ? NetLy_1.connectionMessages.NO_CONNECTION : _h, _j = _a.messageConnected, messageConnected = _j === void 0 ? NetLy_1.connectionMessages.CONNECTED : _j, _k = _a.messageSlowConnection, messageSlowConnection = _k === void 0 ? NetLy_1.connectionMessages.SLOW_CONNECTION : _k, contentStyle = _a.contentStyle, toastTextStyle = _a.toastTextStyle, _l = _a.debug, debug = _l === void 0 ? false : _l, slowConnectionDuration = _a.slowConnectionDuration;
    var _m = (0, useNetworkStatus_1.default)({ debug: debug, slowConnectionDuration: slowConnectionDuration }), networkState = _m[0], prevNetworkState = _m[1];
    var _o = (0, react_1.useState)(false), showToast = _o[0], setShowToast = _o[1];
    var _p = (0, react_1.useState)(""), toastMessage = _p[0], setToastMessage = _p[1];
    var _q = (0, react_1.useState)(connectedColor), toastColor = _q[0], setToastColor = _q[1];
    var animatedValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        // When network goes down
        if (networkState === NetLy_1.NetworkStatus.NO_CONNECTION &&
            networkState !== prevNetworkState) {
            setToastMessage(messageNoConnection);
            setToastColor(disconnectedColor);
            show();
        }
        // When network is restored
        else if (prevNetworkState === NetLy_1.NetworkStatus.NO_CONNECTION &&
            networkState === NetLy_1.NetworkStatus.CONNECTED) {
            setToastMessage(messageConnected);
            setToastColor(connectedColor);
            show();
        }
        // When network becomes slow
        else if (prevNetworkState === NetLy_1.NetworkStatus.CONNECTED &&
            networkState === NetLy_1.NetworkStatus.SLOW_CONNECTION) {
            setToastMessage(messageSlowConnection);
            setToastColor(slowConnectionColor);
            show();
        }
        // Always schedule a dismiss when network is connected (or restored)
        if (networkState === NetLy_1.NetworkStatus.CONNECTED) {
            var timeout_1 = setTimeout(function () { return dismiss(); }, dismissTimeout);
            return function () { return clearTimeout(timeout_1); };
        }
    }, [networkState]);
    var show = function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            react_native_1.Animated.timing(animatedValue, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: false,
            }).start(function () { return setShowToast(true); });
        });
    };
    var dismiss = function () {
        // Dismiss regardless of previous state if network is connected
        if (networkState === NetLy_1.NetworkStatus.CONNECTED) {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                react_native_1.Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: animationDuration,
                    useNativeDriver: false,
                }).start(function () { return setShowToast(false); });
            });
        }
    };
    var toastAnimateStyle = {
        height: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, toastHeight],
        }),
        paddingTop: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, toastHeight / 2],
        }),
        marginBottom: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -toastHeight],
        }),
        backgroundColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["transparent", toastColor],
        }),
    };
    if (!showToast) {
        return null;
    }
    return (<react_native_1.Animated.View style={[styles.toast, toastAnimateStyle, contentStyle]}>
      <react_native_1.Text style={[styles.toastText, toastTextStyle]}>{toastMessage}</react_native_1.Text>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    toast: {
        alignItems: "center",
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
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
