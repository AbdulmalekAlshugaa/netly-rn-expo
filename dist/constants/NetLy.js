"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionMessages = exports.NetworkStatus = void 0;
var NetworkStatus;
(function (NetworkStatus) {
    NetworkStatus["NO_CONNECTION"] = "No Connection";
    NetworkStatus["CONNECTED"] = "Connected";
    NetworkStatus["SLOW_CONNECTION"] = "Slow Connection";
})(NetworkStatus || (exports.NetworkStatus = NetworkStatus = {}));
exports.connectionMessages = {
    NO_CONNECTION: 'No Internet Connection',
    CONNECTED: 'Internet Connection Restored',
    SLOW_CONNECTION: 'Slow Internet Connection',
};
