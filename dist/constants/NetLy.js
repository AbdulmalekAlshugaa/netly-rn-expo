"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SLOW_SAMPLE_COUNT = exports.DEFAULT_SLOW_THRESHOLD = exports.DEFAULT_POLL_INTERVAL = exports.DEFAULT_PING_URL = exports.connectionMessages = exports.NetworkStatus = void 0;
var NetworkStatus;
(function (NetworkStatus) {
    NetworkStatus["NO_CONNECTION"] = "No Connection";
    NetworkStatus["CONNECTED"] = "Connected";
    NetworkStatus["SLOW_CONNECTION"] = "Slow Connection";
})(NetworkStatus || (exports.NetworkStatus = NetworkStatus = {}));
exports.connectionMessages = {
    NO_CONNECTION: 'You are offline',
    CONNECTED: 'Back online',
    SLOW_CONNECTION: 'Slow connection detected',
};
/**
 * Default endpoint probed to measure latency. Returns an empty 204 response.
 * Override via the `pingUrl` option in regions where Google is unreachable.
 */
exports.DEFAULT_PING_URL = 'https://clients3.google.com/generate_204';
exports.DEFAULT_POLL_INTERVAL = 10000;
exports.DEFAULT_SLOW_THRESHOLD = 2000;
exports.DEFAULT_SLOW_SAMPLE_COUNT = 2;
