# Launch checklist for v2.0.0

Everything below is a draft / instruction — nothing is published automatically.

## 1. Publish to npm

```sh
yarn test && yarn build
npm publish        # prepublishOnly rebuilds dist
git tag v2.0.0 && git push --tags
```

## 2. Create an Expo Snack demo

Go to [snack.expo.dev](https://snack.expo.dev), add `netly-rn-expo` and
`@react-native-community/netinfo` as dependencies, and paste:

```tsx
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import NetworkStatusToast from "netly-rn-expo";

export default function App() {
  return (
    <View style={styles.container}>
      <NetworkStatusToast pollInterval={5000} slowThreshold={1000} debug />
      <Text style={styles.title}>netly-rn-expo demo</Text>
      <Text style={styles.hint}>
        Run on your device with Expo Go, then toggle airplane mode to see the
        offline / back-online toasts. Throttle your connection to trigger the
        slow-connection warning.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  hint: { textAlign: "center", color: "#666" },
});
```

Save the Snack, copy its URL, and add it to the README under "Demo":
`Try it now in your browser/device: <snack url>`.

## 3. Record a fresh demo GIF

- Run the example app on a simulator, screen-record while toggling network
  (Cmd+Shift+R in iOS Simulator records; or `adb emu network` on Android).
- Show all three states: offline (red, persists) → reconnect (green,
  auto-dismiss) → slow (yellow, via Network Link Conditioner).
- Convert to GIF (`ffmpeg -i demo.mov -vf "fps=15,scale=320:-1" demo.gif`)
  and embed at the top of the README.

## 4. Submit to reactnative.directory

Fork [react-native-directory](https://github.com/react-native-community/directory),
add an entry to `react-native-libraries.json`:

```json
{
  "githubUrl": "https://github.com/AbdulmalekAlshugaa/netly-rn-expo",
  "npmPkg": "netly-rn-expo",
  "examples": ["<snack url>"],
  "ios": true,
  "android": true,
  "expoGo": true
}
```

Open a PR; their CI validates the entry.

## 5. Launch post draft (Dev.to / Medium)

**Title:** Detecting *slow* connections in React Native — not just offline

**Outline:**
1. The problem: every app handles offline; almost none handle "technically
   online but unusable" (1 bar of LTE, captive portals, congested Wi‑Fi).
   Users blame *your app* for it.
2. Why NetInfo alone can't tell you: `isConnected: true` says nothing about
   usable bandwidth/latency.
3. The approach: lightweight latency probes against a 204 endpoint +
   hysteresis (N consecutive slow samples) to avoid flapping, paused in the
   background to save battery.
4. Show the 1-line integration (`<NetworkStatusToast />`) and the headless
   `useNetworkStatus` hook for custom UX (low-bandwidth mode, retry banners).
5. Honest comparison: when you'd rather use react-native-offline (Redux
   offline queues) vs this (drop-in toast + slow detection).
6. Link: GitHub, npm, Snack demo.

**r/reactnative post:** short version of the above ("I rewrote my
network-toast library: real tests, slow-connection detection with
hysteresis, zero deps — feedback welcome"), link the Snack first, repo
second. Answer every comment in the first 24h.

## 6. After launch

- Add 2–3 `good first issue` tickets (e.g. "web support for StatusBar
  offset", "RTL message audit", "Detox e2e example") so visitors see an
  active, welcoming repo.
- Enable GitHub Discussions or pin a "v2 feedback" issue.
- Watch npm downloads + GitHub traffic (Insights → Traffic) for what works.
