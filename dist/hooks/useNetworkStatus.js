"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var netinfo_1 = require("@react-native-community/netinfo");
var react_1 = require("react");
var react_native_1 = require("react-native");
var usePreviousValue_1 = __importDefault(require("./usePreviousValue"));
var NetLy_1 = require("../constants/NetLy");
// Only pause when we know for sure the app left the foreground; any other
// value (including 'unknown' at startup) counts as active.
var isActiveState = function (state) {
    return state !== "background" && state !== "inactive";
};
var useNetworkStatus = function (options) {
    if (options === void 0) { options = {}; }
    var _a = options.pollInterval, pollInterval = _a === void 0 ? NetLy_1.DEFAULT_POLL_INTERVAL : _a, _b = options.slowThreshold, slowThreshold = _b === void 0 ? NetLy_1.DEFAULT_SLOW_THRESHOLD : _b, _c = options.slowSampleCount, slowSampleCount = _c === void 0 ? NetLy_1.DEFAULT_SLOW_SAMPLE_COUNT : _c, _d = options.pingUrl, pingUrl = _d === void 0 ? NetLy_1.DEFAULT_PING_URL : _d, _e = options.pingTimeout, pingTimeout = _e === void 0 ? Math.min(slowThreshold * 2, pollInterval) : _e, onStatusChange = options.onStatusChange, _f = options.debug, debug = _f === void 0 ? false : _f, _g = options.fetchFn, fetchFn = _g === void 0 ? fetch : _g;
    var netInfo = (0, netinfo_1.useNetInfo)();
    var _h = (0, react_1.useState)(NetLy_1.NetworkStatus.CONNECTED), status = _h[0], setStatus = _h[1];
    var prevStatus = (0, usePreviousValue_1.default)(status);
    var _j = (0, react_1.useState)(function () {
        return isActiveState(react_native_1.AppState.currentState);
    }), appActive = _j[0], setAppActive = _j[1];
    var _k = (0, react_1.useState)(null), pollResult = _k[0], setPollResult = _k[1];
    var slowSamplesRef = (0, react_1.useRef)(0);
    // Latest probe configuration, read inside the probe so changing callbacks
    // or thresholds never tears down and restarts the polling interval.
    var probeOptsRef = (0, react_1.useRef)({
        slowThreshold: slowThreshold,
        slowSampleCount: slowSampleCount,
        pingUrl: pingUrl,
        pingTimeout: pingTimeout,
        fetchFn: fetchFn,
        debug: debug,
    });
    (0, react_1.useEffect)(function () {
        probeOptsRef.current = {
            slowThreshold: slowThreshold,
            slowSampleCount: slowSampleCount,
            pingUrl: pingUrl,
            pingTimeout: pingTimeout,
            fetchFn: fetchFn,
            debug: debug,
        };
    });
    // Effect A: track foreground/background so polling pauses in the background.
    (0, react_1.useEffect)(function () {
        var subscription = react_native_1.AppState.addEventListener("change", function (state) {
            setAppActive(isActiveState(state));
        });
        return function () { var _a; return (_a = subscription === null || subscription === void 0 ? void 0 : subscription.remove) === null || _a === void 0 ? void 0 : _a.call(subscription); };
    }, []);
    // Effect B: latency polling. The interval is created and cleared by the
    // same effect run, so it can never leak or silently die on dep changes.
    // Coming back online or returning to the foreground re-runs the effect,
    // which fires an immediate probe before resuming the interval.
    (0, react_1.useEffect)(function () {
        if (netInfo.isConnected !== true || !appActive) {
            slowSamplesRef.current = 0;
            return;
        }
        var cancelled = false;
        var controller;
        var probe = function () { return __awaiter(void 0, void 0, void 0, function () {
            var opts, log, timeoutId, start, response, duration, ok, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        opts = probeOptsRef.current;
                        log = function (message) {
                            if (opts.debug)
                                console.log("[netly-rn-expo] ".concat(message));
                        };
                        controller =
                            typeof AbortController !== "undefined" ? new AbortController() : undefined;
                        timeoutId = controller
                            ? setTimeout(function () { return controller === null || controller === void 0 ? void 0 : controller.abort(); }, opts.pingTimeout)
                            : undefined;
                        start = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, opts.fetchFn(opts.pingUrl, {
                                headers: {
                                    "Cache-Control": "no-cache, no-store, must-revalidate",
                                    Pragma: "no-cache",
                                    Expires: "0",
                                },
                                signal: controller === null || controller === void 0 ? void 0 : controller.signal,
                            })];
                    case 2:
                        response = _b.sent();
                        duration = Date.now() - start;
                        ok = response.status >= 200 && response.status < 300;
                        if (ok && duration <= opts.slowThreshold) {
                            log("Probe ok in ".concat(duration, "ms"));
                            slowSamplesRef.current = 0;
                        }
                        else {
                            log(ok
                                ? "Probe slow: ".concat(duration, "ms")
                                : "Probe failed with status ".concat(response.status));
                            slowSamplesRef.current += 1;
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        _a = _b.sent();
                        log("Probe errored or timed out");
                        slowSamplesRef.current += 1;
                        return [3 /*break*/, 5];
                    case 4:
                        if (timeoutId !== undefined)
                            clearTimeout(timeoutId);
                        return [7 /*endfinally*/];
                    case 5:
                        if (!cancelled) {
                            setPollResult(slowSamplesRef.current >= probeOptsRef.current.slowSampleCount
                                ? "slow"
                                : "fast");
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        probe();
        var id = setInterval(probe, pollInterval);
        return function () {
            cancelled = true;
            controller === null || controller === void 0 ? void 0 : controller.abort();
            clearInterval(id);
        };
    }, [netInfo.isConnected, appActive, pollInterval]);
    // Effect C: derive the public status from connectivity + probe results.
    (0, react_1.useEffect)(function () {
        if (netInfo.type === "unknown")
            return;
        if (!netInfo.isConnected) {
            slowSamplesRef.current = 0;
            setPollResult(null);
            setStatus(NetLy_1.NetworkStatus.NO_CONNECTION);
        }
        else if (pollResult === "slow") {
            setStatus(NetLy_1.NetworkStatus.SLOW_CONNECTION);
        }
        else {
            setStatus(NetLy_1.NetworkStatus.CONNECTED);
        }
    }, [netInfo.isConnected, netInfo.type, pollResult]);
    // Effect D: notify on transitions (never on mount or unrelated re-renders).
    var onStatusChangeRef = (0, react_1.useRef)(onStatusChange);
    (0, react_1.useEffect)(function () {
        onStatusChangeRef.current = onStatusChange;
    });
    var lastReportedRef = (0, react_1.useRef)(status);
    (0, react_1.useEffect)(function () {
        var _a;
        if (lastReportedRef.current === status)
            return;
        var prev = lastReportedRef.current;
        lastReportedRef.current = status;
        if (probeOptsRef.current.debug) {
            console.log("[netly-rn-expo] State transition: ".concat(prev, " -> ").concat(status));
        }
        (_a = onStatusChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onStatusChangeRef, status, prev);
    }, [status]);
    return {
        status: status,
        prevStatus: prevStatus,
        isConnected: status !== NetLy_1.NetworkStatus.NO_CONNECTION,
        isSlow: status === NetLy_1.NetworkStatus.SLOW_CONNECTION,
    };
};
exports.default = useNetworkStatus;
