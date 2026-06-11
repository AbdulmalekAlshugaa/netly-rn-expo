# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`netly-rn-expo` is a published npm library (not an app) that provides a React Native network-status toast and the hook behind it. It targets both bare React Native and Expo. `@react-native-community/netinfo`, `react`, and `react-native` are **peer dependencies**; the package has **zero runtime dependencies** — keep it that way.

## Commands

```sh
yarn typecheck  # tsc --noEmit over all of src (including tests)
yarn test       # jest
yarn test src/test/useNetworkStatus.test.ts   # run a single test file
yarn build      # tsc -p tsconfig.build.json — compiles src/ (minus tests) to dist/
```

- Package manager is **yarn** (yarn.lock committed). `prepublishOnly` runs the build, so `dist/` is always fresh before publish. `files: ["dist", ...]` keeps the tarball lean.
- CI (`.github/workflows/ci.yml`) runs typecheck → test → build on every push/PR to main.
- The `example/` directory is a standalone Expo app whose `metro.config.js` resolves `netly-rn-expo` to the local `../src` (with react/react-native pinned to the example's node_modules to avoid duplicate React). Use it for on-device verification: `cd example && yarn install && npx expo start`.

## Architecture

Public API from `src/index.ts`: `NetworkStatusToast` (also the **default export** — keep both, the README relies on the default import) and `useNetworkStatus`, plus the `NetworkStatus` enum and all prop/option types.

**`useNetworkStatus` (`src/hooks/useNetworkStatus.ts`)** derives `CONNECTED | NO_CONNECTION | SLOW_CONNECTION` from two signals:
1. `useNetInfo()` connectivity → `NO_CONNECTION`. `type === "unknown"` is ignored to avoid startup flicker.
2. A latency probe loop: every `pollInterval` (default 10s) it fetches `pingUrl` (default Google `generate_204`) and compares duration against `slowThreshold` (default 2s). **Hysteresis**: `slowSampleCount` (default 2) consecutive slow/failed/timed-out probes enter `SLOW_CONNECTION`; one fast probe exits. Probes abort via `AbortController` after `pingTimeout`.

Effect structure is deliberate — the polling interval is created and cleared by the *same* effect run (deps: `isConnected`, `appActive`, `pollInterval`). v1 had a guard-ref pattern here that permanently killed polling after the first state change; don't reintroduce it. Going back online or foregrounding re-runs the effect, which fires an immediate probe. Polling stops entirely while offline or backgrounded (AppState subscription).

The hook returns `{ status, prevStatus, isConnected, isSlow }`. `prevStatus` (from `usePreviousValue`) matters because the toast fires on *transitions*, not states. `fetchFn` is a DI seam for tests.

**`NetworkStatusToast` (`src/view/NetworkStatusToast.tsx`)** maps transitions to message + color and slides via translateY/opacity on the **native driver** (do not animate height/backgroundColor — that forces `useNativeDriver: false`). Offline toast persists; reconnect/slow toasts auto-dismiss. Safe-area handling is a dependency-free heuristic via `topOffset` default; exact insets are the consumer's job (documented in README). `renderToast` swaps the content but keeps the animated shell.

## Testing gotchas

- Tests use `@testing-library/react-native` (`renderHook` included). `@testing-library/react-hooks` is deprecated — don't add it back.
- In RN's jest environment, `AppState.currentState` is a **function** (mock), not a string. The hook's `isActiveState` therefore only treats explicit `'background'`/`'inactive'` as inactive — preserve that logic.
- RN's built-in mocks (e.g. `AccessibilityInfo`) are persistent jest.fns; call counts leak across tests unless `jest.clearAllMocks()` runs in `beforeEach`.
- `jest.setup.js` registers the default netinfo mock; test files override `useNetInfo` with controllable `jest.fn`s.
- Component tests pass `animationDuration={0}` and use fake timers; the hook suite drives probes with `jest.advanceTimersByTimeAsync`.
- devDependencies pin `react@18.2.0` / `react-test-renderer@18.2.0` to match react-native 0.74's renderer — don't bump react independently of react-native.

## Conventions

- `strict: true` TypeScript; `jsx: "react-native"`. `tsconfig.build.json` excludes `src/test` so tests never ship in `dist/`.
- When changing public API or behavior: update README's props table, `CHANGELOG.md`, and the example app together. Version bumps follow semver (v2.0.0 was a breaking rewrite; see CHANGELOG for the v1→v2 mapping).
- `docs/PROMOTION.md` holds the launch checklist (Snack demo, reactnative.directory, post drafts) — drafts only; the maintainer publishes manually.
