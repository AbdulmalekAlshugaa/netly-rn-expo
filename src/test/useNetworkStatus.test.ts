import { act, renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { NetworkStatus } from "../constants/NetLy";

jest.mock("@react-native-community/netinfo", () => ({
  useNetInfo: jest.fn(),
}));

const mockUseNetInfo = useNetInfo as jest.Mock;

const okResponse = { status: 204 } as Response;
const fastFetch = () =>
  jest.fn(() => Promise.resolve(okResponse)) as jest.Mock & typeof fetch;
const delayedFetch = (getDelay: () => number) =>
  jest.fn(
    () =>
      new Promise<Response>((resolve) =>
        setTimeout(() => resolve(okResponse), getDelay())
      )
  ) as jest.Mock & typeof fetch;

let appStateListeners: Array<(state: string) => void> = [];
const setAppState = (state: string) =>
  act(() => {
    appStateListeners.forEach((listener) => listener(state));
  });

const flush = () => act(async () => {});
const advance = (ms: number) =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
  appStateListeners = [];
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation(((_type: string, handler: (state: string) => void) => {
      appStateListeners.push(handler);
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener);
  mockUseNetInfo.mockReturnValue({ isConnected: true, type: "wifi" });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("useNetworkStatus", () => {
  it("reports CONNECTED when online and probes are fast", async () => {
    const fetchFn = fastFetch();
    const { result } = renderHook(() => useNetworkStatus({ fetchFn }));
    await flush();

    expect(result.current.status).toBe(NetworkStatus.CONNECTED);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isSlow).toBe(false);
  });

  it("reports NO_CONNECTION when offline and does not probe", async () => {
    mockUseNetInfo.mockReturnValue({ isConnected: false, type: "wifi" });
    const fetchFn = fastFetch();
    const { result } = renderHook(() => useNetworkStatus({ fetchFn }));
    await flush();

    expect(result.current.status).toBe(NetworkStatus.NO_CONNECTION);
    expect(result.current.isConnected).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("ignores the initial 'unknown' netinfo state", async () => {
    mockUseNetInfo.mockReturnValue({ isConnected: null, type: "unknown" });
    const fetchFn = fastFetch();
    const { result } = renderHook(() => useNetworkStatus({ fetchFn }));
    await flush();

    expect(result.current.status).toBe(NetworkStatus.CONNECTED);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("probes immediately, then on every poll interval", async () => {
    const fetchFn = fastFetch();
    renderHook(() => useNetworkStatus({ fetchFn, pollInterval: 1000 }));
    await flush();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    await advance(1000);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    await advance(3000);
    expect(fetchFn).toHaveBeenCalledTimes(5);
  });

  it("applies hysteresis and keeps polling across status transitions", async () => {
    let delay = 500;
    const fetchFn = delayedFetch(() => delay);
    const { result } = renderHook(() =>
      useNetworkStatus({
        fetchFn,
        pollInterval: 1000,
        slowThreshold: 100,
        slowSampleCount: 2,
        pingTimeout: 10000,
      })
    );

    // Probe 1 resolves slow at t=500: one sample is not enough.
    await advance(500);
    expect(result.current.status).toBe(NetworkStatus.CONNECTED);

    // Probe 2 (t=1000) resolves slow at t=1500: second consecutive sample.
    await advance(1000);
    expect(result.current.status).toBe(NetworkStatus.SLOW_CONNECTION);

    // Regression (v1 bug): polling must survive the status transition.
    delay = 50;
    await advance(1000); // probe 3 fires at t=2000, resolves fast at t=2050
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBe(NetworkStatus.CONNECTED);

    await advance(1000); // probe 4 still fires
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });

  it("treats probe failures as slow samples", async () => {
    const fetchFn = jest.fn(() =>
      Promise.reject(new Error("network fail"))
    ) as jest.Mock & typeof fetch;
    const { result } = renderHook(() =>
      useNetworkStatus({ fetchFn, slowSampleCount: 1 })
    );
    await flush();

    expect(result.current.status).toBe(NetworkStatus.SLOW_CONNECTION);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isSlow).toBe(true);
  });

  it("treats non-2xx probe responses as slow samples", async () => {
    const fetchFn = jest.fn(() =>
      Promise.resolve({ status: 500 } as Response)
    ) as jest.Mock & typeof fetch;
    const { result } = renderHook(() =>
      useNetworkStatus({ fetchFn, slowSampleCount: 1 })
    );
    await flush();

    expect(result.current.status).toBe(NetworkStatus.SLOW_CONNECTION);
  });

  it("re-probes immediately when the connection is restored", async () => {
    mockUseNetInfo.mockReturnValue({ isConnected: false, type: "wifi" });
    const fetchFn = fastFetch();
    const onStatusChange = jest.fn();
    const { result, rerender } = renderHook(() =>
      useNetworkStatus({ fetchFn, pollInterval: 1000, onStatusChange })
    );
    await flush();
    expect(result.current.status).toBe(NetworkStatus.NO_CONNECTION);
    expect(fetchFn).not.toHaveBeenCalled();

    mockUseNetInfo.mockReturnValue({ isConnected: true, type: "wifi" });
    rerender({});
    await flush();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe(NetworkStatus.CONNECTED);
    expect(onStatusChange).toHaveBeenLastCalledWith(
      NetworkStatus.CONNECTED,
      NetworkStatus.NO_CONNECTION
    );
  });

  it("pauses polling in the background and resumes on foreground", async () => {
    const fetchFn = fastFetch();
    renderHook(() => useNetworkStatus({ fetchFn, pollInterval: 1000 }));
    await flush();
    expect(fetchFn).toHaveBeenCalledTimes(1);

    setAppState("background");
    await advance(5000);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    setAppState("active");
    await flush();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("calls onStatusChange once per transition, never on mount", async () => {
    const fetchFn = fastFetch();
    const onStatusChange = jest.fn();
    const { rerender } = renderHook(() =>
      useNetworkStatus({ fetchFn, onStatusChange })
    );
    await flush();
    expect(onStatusChange).not.toHaveBeenCalled();

    mockUseNetInfo.mockReturnValue({ isConnected: false, type: "wifi" });
    rerender({});
    await flush();
    expect(onStatusChange).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith(
      NetworkStatus.NO_CONNECTION,
      NetworkStatus.CONNECTED
    );

    rerender({});
    await flush();
    expect(onStatusChange).toHaveBeenCalledTimes(1);
  });

  it("probes the configured pingUrl", async () => {
    const fetchFn = fastFetch();
    renderHook(() =>
      useNetworkStatus({ fetchFn, pingUrl: "https://example.com/ping" })
    );
    await flush();

    expect(fetchFn).toHaveBeenCalledWith(
      "https://example.com/ping",
      expect.anything()
    );
  });

  it("stops polling on unmount", async () => {
    const fetchFn = fastFetch();
    const { unmount } = renderHook(() =>
      useNetworkStatus({ fetchFn, pollInterval: 1000 })
    );
    await flush();
    expect(fetchFn).toHaveBeenCalledTimes(1);

    unmount();
    await advance(5000);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
