import React from "react";
import { act, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, StyleSheet, Text } from "react-native";
import NetworkStatusToast from "../view/NetworkStatusToast";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { connectionMessages, NetworkStatus } from "../constants/NetLy";

jest.mock("../hooks/useNetworkStatus");
const mockUseNetworkStatus = useNetworkStatus as jest.Mock;

const hookResult = (status: NetworkStatus, prevStatus?: NetworkStatus) => ({
  status,
  prevStatus,
  isConnected: status !== NetworkStatus.NO_CONNECTION,
  isSlow: status === NetworkStatus.SLOW_CONNECTION,
});

const goOffline = () =>
  mockUseNetworkStatus.mockReturnValue(
    hookResult(NetworkStatus.NO_CONNECTION, NetworkStatus.CONNECTED)
  );
const goOnline = () =>
  mockUseNetworkStatus.mockReturnValue(
    hookResult(NetworkStatus.CONNECTED, NetworkStatus.NO_CONNECTION)
  );
const goSlow = (prev = NetworkStatus.CONNECTED) =>
  mockUseNetworkStatus.mockReturnValue(
    hookResult(NetworkStatus.SLOW_CONNECTION, prev)
  );

const flushAnimations = () =>
  act(() => {
    jest.runOnlyPendingTimers();
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockUseNetworkStatus.mockReturnValue(
    hookResult(NetworkStatus.CONNECTED, undefined)
  );
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("NetworkStatusToast", () => {
  it("renders nothing while connected with no prior outage", () => {
    render(<NetworkStatusToast />);
    expect(screen.toJSON()).toBeNull();
  });

  it("shows the offline toast and keeps it past the dismiss timeout", () => {
    goOffline();
    render(<NetworkStatusToast animationDuration={0} />);

    expect(screen.getByText(connectionMessages.NO_CONNECTION)).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.getByText(connectionMessages.NO_CONNECTION)).toBeTruthy();
  });

  it("shows the reconnect toast and auto-dismisses it", () => {
    goOffline();
    const { rerender } = render(
      <NetworkStatusToast animationDuration={0} dismissTimeout={3000} />
    );
    goOnline();
    rerender(<NetworkStatusToast animationDuration={0} dismissTimeout={3000} />);

    expect(screen.getByText(connectionMessages.CONNECTED)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    flushAnimations();
    expect(screen.queryByText(connectionMessages.CONNECTED)).toBeNull();
  });

  it("shows the slow toast on any transition into the slow state", () => {
    goSlow(NetworkStatus.NO_CONNECTION);
    render(<NetworkStatusToast animationDuration={0} />);
    expect(screen.getByText(connectionMessages.SLOW_CONNECTION)).toBeTruthy();
  });

  it("never shows slow toasts when showSlowConnection is false", () => {
    goSlow();
    render(
      <NetworkStatusToast animationDuration={0} showSlowConnection={false} />
    );
    expect(screen.toJSON()).toBeNull();
  });

  it("supports custom messages", () => {
    goOffline();
    render(
      <NetworkStatusToast animationDuration={0} messageNoConnection="Sin conexión" />
    );
    expect(screen.getByText("Sin conexión")).toBeTruthy();
  });

  it("renders custom content via renderToast", () => {
    goOffline();
    render(
      <NetworkStatusToast
        animationDuration={0}
        renderToast={({ message, status }) => (
          <Text>{`custom:${status}:${message}`}</Text>
        )}
      />
    );

    expect(
      screen.getByText(
        `custom:${NetworkStatus.NO_CONNECTION}:${connectionMessages.NO_CONNECTION}`
      )
    ).toBeTruthy();
    expect(screen.queryByText(connectionMessages.NO_CONNECTION)).toBeNull();
  });

  it("positions at the bottom with the configured offset", () => {
    goOffline();
    render(
      <NetworkStatusToast
        animationDuration={0}
        position="bottom"
        bottomOffset={20}
        toastHeight={50}
      />
    );

    const root = screen.toJSON() as any;
    const style = StyleSheet.flatten(root.props.style);
    expect(style.bottom).toBe(0);
    expect(style.top).toBeUndefined();
    expect(style.height).toBe(70); // toastHeight + bottomOffset
    expect(style.paddingBottom).toBe(20);
  });

  it("respects a custom topOffset", () => {
    goOffline();
    render(
      <NetworkStatusToast animationDuration={0} topOffset={40} toastHeight={50} />
    );

    const style = StyleSheet.flatten((screen.toJSON() as any).props.style);
    expect(style.top).toBe(0);
    expect(style.height).toBe(90);
    expect(style.paddingTop).toBe(40);
  });

  it("announces status changes to screen readers", () => {
    const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
    goOffline();
    render(<NetworkStatusToast animationDuration={0} />);

    expect(announce).toHaveBeenCalledWith(connectionMessages.NO_CONNECTION);
  });

  it("does not announce when announceForAccessibility is false", () => {
    const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
    goOffline();
    render(
      <NetworkStatusToast animationDuration={0} announceForAccessibility={false} />
    );

    expect(announce).not.toHaveBeenCalled();
  });

  it("forwards hook options including onStatusChange", () => {
    const onStatusChange = jest.fn();
    render(
      <NetworkStatusToast
        onStatusChange={onStatusChange}
        pollInterval={5000}
        pingUrl="https://example.com/ping"
      />
    );

    expect(mockUseNetworkStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        onStatusChange,
        pollInterval: 5000,
        pingUrl: "https://example.com/ping",
      })
    );
  });
});
