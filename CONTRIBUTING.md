# Contributing

Thanks for your interest in improving netly-rn-expo!

## Development setup

```sh
git clone https://github.com/AbdulmalekAlshugaa/netly-rn-expo.git
cd netly-rn-expo
yarn install
```

## Workflow

```sh
yarn typecheck   # tsc --noEmit over src (including tests)
yarn test        # jest
yarn build       # compile src/ -> dist/
```

CI runs all three on every PR — please make sure they pass locally first.

## Trying changes in the example app

The `example/` directory contains an Expo app wired to the local source:

```sh
cd example
yarn install
npx expo start
```

Then on a device/simulator:

- Toggle airplane mode to see the offline / back-online toasts.
- Throttle the connection (e.g. Network Link Conditioner, Chrome DevTools throttling for web) to trigger the slow-connection toast.

## Reporting bugs / requesting features

Open an issue with reproduction steps (or an Expo Snack link if possible),
the package version, and your React Native / Expo versions.

## Releasing (maintainers)

1. Update `version` in `package.json` and add a `CHANGELOG.md` entry.
2. `npm publish` — `prepublishOnly` builds `dist/` automatically.
