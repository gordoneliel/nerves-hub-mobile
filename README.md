# NervesHub Mobile

A React Native mobile client for [NervesHub](https://www.nerves-hub.org/).

Manage your NervesHub devices, deployments, and firmware from your phone.

## Features

- Login to your NervesHub instance
- View and select Organizations & Products
- Browse and manage devices, deployment groups, and firmware
- Live device console via Phoenix channels (Coming soon)
- Pin frequently accessed devices (Coming soon)
- Run scripts on devices (Coming soon)
- Dark mode support

## Prerequisites

- Node.js
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Xcode and CocoaPods
- Android: Android Studio

## Getting Started

```bash
npm install
```

### iOS

```bash
npx expo run:ios
```

### Android

```bash
npx expo run:android
```

## API Client Generation

The API client is generated from the NervesHub OpenAPI spec using [Orval](https://orval.dev/):

```bash
npm run api:generate
```

## Project Structure

```
src/
  api/          # Generated API client and custom Axios instance
  components/   # Reusable UI components
  context/      # Auth and org/product context providers
  hooks/        # Custom hooks (API, channels, orgs)
  navigation/   # React Navigation stack and tab definitions
  screens/      # App screens (devices, deployments, firmware, etc.)
  theme/        # Colors, spacing, and theming utilities
  utils/        # Secure storage and persistence helpers
```
