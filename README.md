# netly-rn-expo

[![npm version](https://img.shields.io/npm/v/netly-rn-expo.svg)](https://www.npmjs.com/package/netly-rn-expo)
[![npm downloads](https://img.shields.io/npm/dm/netly-rn-expo.svg)](https://www.npmjs.com/package/netly-rn-expo)
[![CI](https://github.com/AbdulmalekAlshugaa/netly-rn-expo/actions/workflows/ci.yml/badge.svg)](https://github.com/AbdulmalekAlshugaa/netly-rn-expo/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/netly-rn-expo.svg)](./LICENSE)

A lightweight network-status toast for React Native and Expo that tells your users when they go **offline**, come **back online**, or are on a **slow connection** — the case most libraries ignore.

- 🐌 **Slow-connection detection**, not just offline/online: a low-overhead latency probe with hysteresis, so one hiccup never flashes a false alarm.
- 🪶 **Zero runtime dependencies** (only `@react-native-community/netinfo` as a peer).
- ⚡ Animations on the **native driver**; polling pauses automatically in the background.
- 📱 Works with **Expo (managed & bare)** and React Native CLI, iOS and Android.
- ♿ Toasts are **announced to screen readers**.
- 🔧 Fully customizable — or skip the UI entirely and use the `useNetworkStatus` hook.

## Demo

[https://github.com/user-attachments/assets/cc6e8909-42aa-4a53-a1b1-62eb4decc6a2](https://github.com/user-attachments/assets/cc6e8909-42aa-4a53-a1b1-62eb4decc6a2)

## Installation

```sh
npm install netly-rn-expo @react-native-community/netinfo
# or
yarn add netly-rn-expo @react-native-community/netinfo
# or, in an Expo app
npx expo install @react-native-community/netinfo && npm install netly-rn-expo
```

## Quick start

Drop the toast once near the root of your app:

```tsx
import React from "react";
import { View, Text } from "react-native";
import NetworkStatusToast from "netly-rn-expo";

const App = () => (
  <View style={{ flex: 1 }}>
    <NetworkStatusToast />
    <Text>Welcome to my app!</Text>
  </View>
);

export default App;
```

That's it. Offline shows a persistent red toast; reconnecting shows a green one that auto-dismisses; a sluggish connection shows a yellow warning.

## Just the hook

Don't want the built-in UI? Use the hook and render anything you like:

```tsx
import { useNetworkStatus, NetworkStatus } from "netly-rn-expo";

const ConnectionAwareScreen = () => {
  const { status, isConnected, isSlow } = useNetworkStatus({
    pollInterval: 10000,
    slowThreshold: 2000,
    onStatusChange: (status, prev) => console.log(`${prev} -> ${status}`),
  });

  if (!isConnected) return <OfflineScreen />;
  if (isSlow) return <LowBandwidthMode />;
  return <FullExperience />;
};
```

### How slow detection works

Every `pollInterval` ms (while the app is foregrounded and online) the hook fetches `pingUrl` — a tiny 204 endpoint — and measures latency. After `slowSampleCount` consecutive probes slower than `slowThreshold` (or failing/timing out), status becomes `SLOW_CONNECTION`. A single fast probe flips it back. Polling stops entirely while offline or backgrounded.

## Customization

```tsx
<NetworkStatusToast
  position="bottom"
  bottomOffset={24}
  disconnectedColor="#B00020"
  messageNoConnection="No internet connection"
  dismissTimeout={4000}
  slowThreshold={1500}
  pingUrl="https://my-api.example.com/health" // e.g. where Google is unreachable
  onStatusChange={(status) => analytics.track("network_status", { status })}
/>
```

Fully custom content, keeping the slide animation:

```tsx
<NetworkStatusToast
  renderToast={({ status, message, dismiss }) => (
    <Pressable onPress={dismiss}>
      <Text style={{ color: "white" }}>{message} — tap to hide</Text>
    </Pressable>
  )}
/>
```

### Safe areas

By default the toast reserves a platform-heuristic offset for the status bar / notch. For exact insets, pass them in from [react-native-safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context):

```tsx
const insets = useSafeAreaInsets();
<NetworkStatusToast topOffset={insets.top} />
```

### `NetworkStatusToast` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `'top' \| 'bottom'` | `'top'` | Edge the toast slides in from |
| `topOffset` | `number` | platform heuristic | Space reserved for status bar / notch |
| `bottomOffset` | `number` | `0` | Space reserved above the bottom edge |
| `toastHeight` | `number` | `56` | Toast content height (excluding offset) |
| `disconnectedColor` | `string` | `#F44336` | Offline toast color |
| `connectedColor` | `string` | `#4CAF50` | Back-online toast color |
| `slowConnectionColor` | `string` | `#FFC107` | Slow-connection toast color |
| `messageNoConnection` | `string` | `"You are offline"` | Offline message |
| `messageConnected` | `string` | `"Back online"` | Reconnected message |
| `messageSlowConnection` | `string` | `"Slow connection detected"` | Slow-connection message |
| `showSlowConnection` | `boolean` | `true` | Set `false` to disable slow toasts |
| `animationDuration` | `number` | `300` | Slide animation duration (ms) |
| `dismissTimeout` | `number` | `3000` | Auto-dismiss delay for reconnect/slow toasts; the offline toast persists |
| `contentStyle` | `ViewStyle` | — | Container style override |
| `toastTextStyle` | `TextStyle` | — | Text style override |
| `renderToast` | `(props) => ReactNode` | — | Replace the default content (`{status, message, color, dismiss}`) |
| `announceForAccessibility` | `boolean` | `true` | Announce status changes to screen readers |
| `onStatusChange` | `(status, prev) => void` | — | Called once per transition |
| `pollInterval` | `number` | `10000` | Latency probe interval (ms) |
| `slowThreshold` | `number` | `2000` | Probe latency counted as slow (ms) |
| `slowSampleCount` | `number` | `2` | Consecutive slow probes before showing the slow toast |
| `pingUrl` | `string` | Google `generate_204` | Latency probe endpoint |
| `debug` | `boolean` | `false` | Log probes and transitions |

### `useNetworkStatus(options)`

Accepts `pollInterval`, `slowThreshold`, `slowSampleCount`, `pingUrl`, `pingTimeout`, `onStatusChange`, `debug`, and `fetchFn` (dependency injection for tests). Returns:

```ts
{
  status: NetworkStatus;                  // CONNECTED | NO_CONNECTION | SLOW_CONNECTION
  prevStatus: NetworkStatus | undefined;
  isConnected: boolean;
  isSlow: boolean;
}
```

## How does it compare?

| | netly-rn-expo | react-native-offline | react-native-offline-status |
| --- | --- | --- | --- |
| Slow-connection detection | ✅ | ❌ | ❌ |
| Drop-in toast UI | ✅ | ❌ (utilities/HOCs) | ✅ |
| Redux required | No | Optimized for Redux | No |
| TypeScript | ✅ strict, types shipped | ✅ | ❌ |
| Expo managed workflow | ✅ | ✅ | ⚠️ unmaintained |

Use `react-native-offline` if you need offline action queues and Redux integration; use netly-rn-expo if you want a polished connection toast (with slow-network awareness) in one line.

## Migrating from v1

See [CHANGELOG.md](./CHANGELOG.md#200-2026-06-11). TL;DR: the hook returns an object instead of a tuple, and `slowConnectionDuration` became `pollInterval` + `slowThreshold`.

## Testing your integration

- **Expo Go**: `npx expo start`, then toggle Wi‑Fi/cellular on the device.
- **Slow network**: use a throttled hotspot, iOS Network Link Conditioner, or Android emulator network speed settings.
- The repo's [`example/`](./example) app is preconfigured for this.

## Requirements

- React Native 0.65+ / Expo SDK 45+
- React 17+
- `@react-native-community/netinfo` 11.4.1+

## Contributing

PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
