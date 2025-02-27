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

| Prop                    | Type        | Default Value                       | Description                                 |
| ----------------------- | ----------- | ----------------------------------- | ------------------------------------------- |
| `disconnectedColor`     | `string`    | `#F44336` (Red)                     | Color for the no connection state           |
| `connectedColor`        | `string`    | `#4CAF50` (Green)                   | Color for the restored connection state     |
| `slowConnectionColor`   | `string`    | `#FFC107` (Yellow)                  | Color for the slow connection state         |
| `toastHeight`           | `number`    | `34`                                | Height of the toast notification            |
| `animationDuration`     | `number`    | `400`                               | Duration of the toast slide animation in ms |
| `dismissTimeout`        | `number`    | `3000`                              | Time in ms before the toast disappears      |
| `messageNoConnection`   | `string`    | "No internet connection"            | Message displayed when no internet          |
| `messageConnected`      | `string`    | "Connected to the internet"         | Message displayed when reconnected          |
| `messageSlowConnection` | `string`    | "Slow internet connection detected" | Message displayed on slow connection        |
| `contentStyle`          | `ViewStyle` | `undefined`                         | Custom styles for the toast container       |
| `toastTextStyle`        | `TextStyle` | `undefined`                         | Custom styles for the toast text            |

## Testing on a Real Device

To test `netly-rn-expo` on a physical device, follow these methods:

### **1. Using Expo Go (For Expo Projects)**

1. Install the **Expo Go** app on your phone.
2. Start the development server:
   ```sh
   expo start
   ```
3. Scan the QR code with Expo Go.
4. **Test network changes:**
   - Disable Wi-Fi or mobile data to see the "No internet connection" toast.
   - Re-enable the connection to see the "Connected to the internet" toast.
   - Switch to a slow network (e.g., throttled hotspot) to trigger "Slow internet connection detected."

### **2. Running on a Physical Device via USB (For Native Testing)**

#### **For Android:**

1. Enable **Developer Mode** and **USB Debugging** on your phone.
2. Connect your device via USB and check if it's recognized:
   ```sh
   adb devices
   ```
3. Run the app on the device:
   ```sh
   expo run:android
   ```

#### **For iOS:**

1. Connect your iPhone via USB.
2. Run:
   ```sh
   expo run:ios --device
   ```
3. Select your real device in **Xcode's Device List**.

### **3. Using EAS Build (For OTA Testing)**

1. Install EAS CLI:
   ```sh
   npm install -g eas-cli
   ```
2. Build for real devices:
   ```sh
   eas build --profile preview --platform all
   ```
3. Download and install the generated build on your device.
4. Test network status changes.

### **4. Firebase Test Lab (For Automated Testing)**

1. Upload your APK/IPA to Firebase Test Lab.
2. Run UI and network tests on real devices.
3. Analyze logs, screenshots, and reports.

## Demo

[https://github.com/user-attachments/assets/cc6e8909-42aa-4a53-a1b1-62eb4decc6a2](https://github.com/user-attachments/assets/cc6e8909-42aa-4a53-a1b1-62eb4decc6a2)

## Requirements

- React Native 0.65+
- Expo 45+ (if using Expo)

## Contributing

Feel free to submit issues or feature requests. PRs are welcome!

## License

MIT License
