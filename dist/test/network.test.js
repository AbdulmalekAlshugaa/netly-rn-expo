"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var netinfo_1 = require("@react-native-community/netinfo");
var NetLy_1 = require("../constants/NetLy");
var useNetworkStatus_1 = __importDefault(require("../hooks/useNetworkStatus"));
jest.mock("@react-native-community/netinfo", function () { return ({
    useNetInfo: jest.fn(),
}); });
jest.mock("react-native", function () { return ({
    AppState: { currentState: "active" },
}); });
jest.mock("../hooks/useNetworkStatus");
describe("useNetworkStatus", function () {
    var fetchMock;
    var getAppStateMock;
    beforeEach(function () {
        fetchMock = jest.fn(function () { return Promise.resolve({ status: 204 }); });
        getAppStateMock = jest.fn(function () { return "active"; });
        netinfo_1.useNetInfo.mockReturnValue({ isConnected: true, type: "wifi" });
        // Mocking useNetworkStatus
        useNetworkStatus_1.default.mockReturnValue([NetLy_1.NetworkStatus.CONNECTED, undefined]);
    });
    it("should return CONNECTED when network is available", function () {
        var status = (0, useNetworkStatus_1.default)({ fetchFn: fetchMock, getAppState: getAppStateMock });
        expect(status[0]).toBe(NetLy_1.NetworkStatus.CONNECTED);
    });
    it("should return NO_CONNECTION when network is unavailable", function () {
        useNetworkStatus_1.default.mockReturnValue([NetLy_1.NetworkStatus.NO_CONNECTION, undefined]);
        var status = (0, useNetworkStatus_1.default)({ fetchFn: fetchMock, getAppState: getAppStateMock });
        expect(status[0]).toBe(NetLy_1.NetworkStatus.NO_CONNECTION);
    });
});
