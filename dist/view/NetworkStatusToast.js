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
exports.NetworkStatus = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var useNetworkStatus_1 = __importDefault(require("../hooks/useNetworkStatus"));
// Configuration constants
var STATUS_BAR_HEIGHT = react_native_1.Platform.OS === 'ios' ? 20 : 0;
var ANIMATION_DURATION = 400;
var DISMISS_TIMEOUT = 3000;
var TOAST_HEIGHT = STATUS_BAR_HEIGHT + 34;
var COLOR_DISCONNECTED = '#F44336'; // Red for disconnected
var COLOR_CONNECTED = '#4CAF50'; // Green for restored connection
var COLOR_SLOW_CONNECTION = '#FFC107'; // Yellow for slow connection
var NetworkStatus;
(function (NetworkStatus) {
    NetworkStatus["NO_CONNECTION"] = "No Connection";
    NetworkStatus["CONNECTED"] = "Connected";
    NetworkStatus["SLOW_CONNECTION"] = "Slow Connection";
})(NetworkStatus || (exports.NetworkStatus = NetworkStatus = {}));
var NetworkStatusToast = function () {
    var _a = (0, useNetworkStatus_1.default)(), networkState = _a[0], prevNetworkState = _a[1];
    console.log('current states', networkState);
    console.log('prev states', prevNetworkState);
    // Local state for controlling toast display
    var _b = (0, react_1.useState)(false), showToast = _b[0], setShowToast = _b[1];
    var _c = (0, react_1.useState)(''), toastMessage = _c[0], setToastMessage = _c[1];
    var _d = (0, react_1.useState)(COLOR_CONNECTED), toastColor = _d[0], setToastColor = _d[1];
    // Animated value for the toast
    var animatedValue = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        // When network goes down
        if (networkState === NetworkStatus.NO_CONNECTION && networkState !== prevNetworkState) {
            setToastMessage('No Internet Connection');
            setToastColor(COLOR_DISCONNECTED);
            show();
        }
        // When network is restored
        else if (prevNetworkState === NetworkStatus.NO_CONNECTION && networkState === NetworkStatus.CONNECTED) {
            setToastMessage('Internet Connection Restored');
            setToastColor(COLOR_CONNECTED);
            show();
        }
        // When network becomes slow
        else if (prevNetworkState === NetworkStatus.CONNECTED && networkState === NetworkStatus.SLOW_CONNECTION) {
            setToastMessage('Slow Internet Connection');
            setToastColor(COLOR_SLOW_CONNECTION);
            show();
        }
        // Always schedule a dismiss when network is connected (or restored)
        if (networkState === NetworkStatus.CONNECTED) {
            var timeout_1 = setTimeout(function () { return dismiss(); }, DISMISS_TIMEOUT);
            return function () { return clearTimeout(timeout_1); };
        }
    }, [networkState]);
    var show = function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            react_native_1.Animated.timing(animatedValue, {
                toValue: 1,
                duration: ANIMATION_DURATION,
                useNativeDriver: false,
            }).start(function () { return setShowToast(true); });
        });
    };
    var dismiss = function () {
        // Dismiss regardless of previous state if network is connected
        if (networkState === NetworkStatus.CONNECTED) {
            react_native_1.InteractionManager.runAfterInteractions(function () {
                react_native_1.Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: false,
                }).start(function () { return setShowToast(false); });
            });
        }
    };
    var toastAnimateStyle = {
        height: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, TOAST_HEIGHT],
        }),
        paddingTop: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, STATUS_BAR_HEIGHT + 8],
        }),
        marginBottom: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -STATUS_BAR_HEIGHT],
        }),
        backgroundColor: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', toastColor],
        }),
    };
    if (!showToast) {
        return null;
    }
    return (<react_native_1.Animated.View style={[styles.toast, toastAnimateStyle]}>
            {react_native_1.Platform.OS === 'ios' && <react_native_1.StatusBar barStyle="light-content" animated/>}
            <react_native_1.Text style={styles.toastText}>{toastMessage}</react_native_1.Text>
        </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    toast: {
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1000,
    },
    // eslint-disable-next-line react-native/no-color-literals
    toastText: {
        color: '#fff',
        fontSize: 14,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
});
exports.default = NetworkStatusToast;
