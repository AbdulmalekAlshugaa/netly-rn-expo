import { useNetInfo } from "@react-native-community/netinfo";
import { NetworkStatus } from "../constants/NetLy";
import useNetworkStatus from "../hooks/useNetworkStatus";

jest.mock("@react-native-community/netinfo", () => ({
  useNetInfo: jest.fn(),
}));

jest.mock("react-native", () => ({
  AppState: { currentState: "active" },
}));

jest.mock("../hooks/useNetworkStatus");

describe("useNetworkStatus", () => {
  let fetchMock: jest.Mock;
  let getAppStateMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn(() => Promise.resolve({ status: 204 }));
    getAppStateMock = jest.fn(() => "active");

    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true, type: "wifi" });

    // Mocking useNetworkStatus
    (useNetworkStatus as jest.Mock).mockReturnValue([NetworkStatus.CONNECTED, undefined]);
  });

  it("should return CONNECTED when network is available", () => {
    const status = useNetworkStatus({ fetchFn: fetchMock, getAppState: getAppStateMock });

    expect(status[0]).toBe(NetworkStatus.CONNECTED);
  });

  it("should return NO_CONNECTION when network is unavailable", () => {
    (useNetworkStatus as jest.Mock).mockReturnValue([NetworkStatus.NO_CONNECTION, undefined]);

    const status = useNetworkStatus({ fetchFn: fetchMock, getAppState: getAppStateMock });

    expect(status[0]).toBe(NetworkStatus.NO_CONNECTION);
  });
});
