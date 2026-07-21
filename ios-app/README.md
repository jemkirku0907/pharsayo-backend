# PharSayo iOS

Native iOS client built with Expo SDK 57, React Native 0.86, and TypeScript.

## Run locally

```bash
npm install
npm start
```

Scan the QR code using Expo Go on an iPhone. Camera scanning must be tested on a physical device.

## Validate

```bash
npx tsc --noEmit
npx expo export --platform ios --output-dir dist-ios --clear
```

## Build for TestFlight or the App Store

An Expo account and Apple Developer membership are required.

```bash
npx eas-cli login
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
```

The iOS bundle identifier is `com.jeoteampogi.pharsayo`.
