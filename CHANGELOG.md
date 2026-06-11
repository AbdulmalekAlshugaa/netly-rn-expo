# Changelog

## 2.0.0 (2026-06-11)

### Breaking changes

- `useNetworkStatus` now returns an object — `{ status, prevStatus, isConnected, isSlow }` — instead of a tuple.
- `slowConnectionDuration` was split into two options that mean what they say:
  - `pollInterval` (default `10000`) — how often the connection is probed.
  - `slowThreshold` (default `2000`) — probe latency above which a sample counts as slow.
- `getAppState` option removed; the hook subscribes to `AppState` internally.
- Default toast height is now `56` and includes a safe-area offset by default (see `topOffset`).
- The "slow connection" toast now shows on *any* transition into the slow state (previously only from the connected state).

### Fixed

- **Polling no longer silently dies.** v1 cleared its probe interval on internal state changes and never rescheduled it, so slow-connection detection stopped working after the first transition.
- The package's default import now works: `import NetworkStatusToast from "netly-rn-expo"` (named exports still available).
- Removed `husky` from runtime dependencies — the package now has zero runtime dependencies.
- Probe requests are aborted on unmount/background (no more stray fetches or state updates after unmount).

### Added

- `slowSampleCount` (default `2`) — consecutive slow probes required before reporting a slow connection, so one hiccup doesn't flash a toast.
- `pingUrl` — override the latency-probe endpoint (useful where `clients3.google.com` is unreachable).
- `pingTimeout` — abort slow probes; a timeout counts as a slow sample.
- `onStatusChange(status, prevStatus)` callback on both the hook and the component.
- `position="top" | "bottom"`, `topOffset`, `bottomOffset` props.
- `renderToast` prop for fully custom toast content.
- `showSlowConnection` prop to opt out of slow-connection toasts.
- Accessibility: toasts are announced to screen readers (`announceForAccessibility` to disable).
- Animations now run on the native driver (translateY/opacity instead of height).
- TypeScript types exported: `UseNetworkStatusOptions`, `UseNetworkStatusResult`, `NetworkStatusToastProps`, `ToastRenderProps`.
- Real test suite (24 tests) and CI.

### Migration from v1

```tsx
// v1
const [status, prevStatus] = useNetworkStatus({ slowConnectionDuration: 30000 });

// v2
const { status, prevStatus, isConnected, isSlow } = useNetworkStatus({
  pollInterval: 10000,
  slowThreshold: 2000,
});
```

Component usage is unchanged unless you relied on `slowConnectionDuration` — replace it with `pollInterval`/`slowThreshold`.

## 1.1.12 (2025-02-28)

Last v1 release.
