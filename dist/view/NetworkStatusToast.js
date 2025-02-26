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
    var _b = _a.disconnectedColor, disconnectedColor = _b === void 0 ? "#F44336" : _b, _c = _a.connectedColor, connectedColor = _c === void 0 ? "#4CAF50" : _c, _d = _a.slowConnectionColor, slowConnectionColor = _d === void 0 ? "#FFC107" : _d, _e = _a.toastHeight, toastHeight = _e === void 0 ? 80 : _e, _f = _a.animationDuration, animationDuration = _f === void 0 ? 400 : _f, _g = _a.dismissTimeout, dismissTimeout = _g === void 0 ? 3000 : _g, renderContent = _a.renderContent, // Consumer can pass a custom UI
    _h = _a.debug, // Consumer can pass a custom UI
    debug = _h === void 0 ? false : _h;
    var _j = (0, useNetworkStatus_1.default)({ debug: debug }), networkState = _j[0], prevNetworkState = _j[1];
    var _k = (0, react_1.useState)(false), showToast = _k[0], setShowToast = _k[1];
    var _l = (0, react_1.useState)(connectedColor), toastColor = _l[0], setToastColor = _l[1];
    var animatedValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        if (networkState !== prevNetworkState) {
            var color = connectedColor;
            if (networkState === NetLy_1.NetworkStatus.NO_CONNECTION)
                color = disconnectedColor;
            else if (networkState === NetLy_1.NetworkStatus.SLOW_CONNECTION)
                color = slowConnectionColor;
            setToastColor(color);
            show();
        }
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
        backgroundColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["transparent", toastColor],
        }),
    };
    if (!showToast) {
        return null;
    }
    return (<react_native_1.Animated.View style={[styles.toast, toastAnimateStyle]}>
      {renderContent ? renderContent(networkState) : <DefaultToastContent networkState={networkState}/>}
    </react_native_1.Animated.View>);
};
// Default content if `renderContent` is not provided
var DefaultToastContent = function (_a) {
    var networkState = _a.networkState;
    var message = NetLy_1.connectionMessages.CONNECTED;
    if (networkState === NetLy_1.NetworkStatus.NO_CONNECTION)
        message = NetLy_1.connectionMessages.NO_CONNECTION;
    else if (networkState === NetLy_1.NetworkStatus.SLOW_CONNECTION)
        message = NetLy_1.connectionMessages.SLOW_CONNECTION;
    return (<react_native_1.View style={styles.defaultContent}>
      <react_native_1.Text style={styles.toastText}>{message}</react_native_1.Text>
    </react_native_1.View>);
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
    defaultContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    toastText: {
        color: "#fff",
        fontSize: 14,
        paddingHorizontal: 16,
        textAlign: "center",
    },
});
exports.default = NetworkStatusToast;
