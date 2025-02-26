# netly-rn-expo

`netly-rn-expo` is a lightweight React Native package for displaying a network status toast that notifies users about their internet connection status in real time. It supports detecting when the network is lost, restored, or becomes slow.

## Installation

To install the package, run:

```sh
npm install netly-rn-expo
```

or if you are using Yarn:

```sh
yarn add netly-rn-expo
```

> **Note:** This package already includes `@react-native-community/netinfo`, so you don’t need to install it separately.

## Usage

Import the `NetworkStatusToast` component and use it in your main app component:

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import NetworkStatusToast from 'netly-rn-expo';

const App = () => {
    return (
        <View style={{ flex: 1 }}>
            <NetworkStatusToast />
            <Text>Welcome to my app!</Text>
        </View>
    );
};

export default App;
```

## Features
- 🚀 Detects and displays a toast when the internet connection is lost or restored.
- ⚡ Identifies slow network connections.
- 🎨 Smooth animations with customizable styles.
- 📱 Works on both iOS and Android.

## Customization

The default styles and messages can be overridden via props. Example:

```tsx
<NetworkStatusToast
    disconnectedColor="red"
    connectedColor="green"
    slowConnectionColor="yellow"
    toastHeight={50}
    animationDuration={500}
    dismissTimeout={3000}
    messageNoConnection="No internet connection"
    messageConnected="Connected to the internet"
    messageSlowConnection="Slow internet connection detected"
    contentStyle={{ backgroundColor: 'black' }}
    toastTextStyle={{ color: 'white' }}
/>
```

### Available Props

| Prop                 | Type     | Default Value  | Description |
|----------------------|----------|---------------|-------------|
| `disconnectedColor` | `string` | `#F44336` (Red) | Color for the no connection state |
| `connectedColor` | `string` | `#4CAF50` (Green) | Color for the restored connection state |
| `slowConnectionColor` | `string` | `#FFC107` (Yellow) | Color for the slow connection state |
| `toastHeight` | `number` | `34` | Height of the toast notification |
| `animationDuration` | `number` | `400` | Duration of the toast slide animation in ms |
| `dismissTimeout` | `number` | `3000` | Time in ms before the toast disappears |
| `messageNoConnection` | `string` | "No internet connection" | Message displayed when no internet |
| `messageConnected` | `string` | "Connected to the internet" | Message displayed when reconnected |
| `messageSlowConnection` | `string` | "Slow internet connection detected" | Message displayed on slow connection |
| `contentStyle` | `ViewStyle` | `undefined` | Custom styles for the toast container |
| `toastTextStyle` | `TextStyle` | `undefined` | Custom styles for the toast text |

## Demo


https://github.com/user-attachments/assets/cc6e8909-42aa-4a53-a1b1-62eb4decc6a2


- 
## Requirements
- React Native 0.65+
- Expo 45+ (if using Expo)

## Contributing

Feel free to submit issues or feature requests. PRs are welcome!

## License

MIT License

