# Kharcha

A minimal, offline expense tracker for iPhone. Open the app (or double-tap the back of the phone), say "spent 500 on Swiggy", and the expense is saved. Speech recognition and the AI that reads the sentence both run on the device. No server.

Plan and decisions: [docs/PLAN.md](docs/PLAN.md).

## Requirements

- macOS with Xcode 26+ (built with Xcode 27.1), Node 24, CocoaPods
- iPhone 15 Pro or newer on iOS 26+ with Apple Intelligence on, for the AI step
- A UTF-8 shell locale for CocoaPods: `export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`

## Run

```bash
npm install
npx expo run:ios                 # simulator
npx expo run:ios --device        # your iPhone (pick a signing team in Xcode the first time)
npx expo start --dev-client      # JS server for an installed dev build
```

The `ios/` folder is generated (`npx expo prebuild -p ios --clean`). Change native settings in `app.json` and `plugins/`, not in `ios/`.

## Check

```bash
npm test             # unit tests (Jest, TZ=Asia/Kolkata)
npm run typecheck
npm run lint
./tools/eval/run-eval.sh   # prompt accuracy on this Mac's Apple model (macOS 26+, Apple Intelligence on)
```

## Simulator limits (development only)

- **Voice input is off in the simulator.** Without microphone access for Simulator on the Mac, CoreAudio deadlocks and iOS kills the app. Use the dashed **DEV** field on the Add tab: it sends a typed sentence through the same path as speech. To try real speech, allow Simulator in macOS Settings › Privacy & Security › Microphone, then set `SIMULATOR_VOICE_INPUT = true` in `src/features/voice/simulator-voice.ts`.
- **Apple's model cannot run in the simulator** (it fails with `promptTemplateNotFound`). In development builds on the simulator only, a stand-in answers the 60 sentences of `tools/eval/phrases.json` with their expected results, so the auto-save flow can be tested. Other sentences fall back to the confirm card. Real iPhones always use the real model.

## Shortcut / Back Tap

The app adds a **Log Expense** action to the Shortcuts app and Siri ("Log expense in Kharcha"). To use Back Tap: Settings › Accessibility › Touch › Back Tap › Double Tap › Log Expense. The in-app guide is in Settings › Shortcut & Back Tap.

## Release to TestFlight

Needs a paid Apple Developer account.

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest submit -p ios --latest
```

Before the first release, change `ios.bundleIdentifier` in `app.json` if `com.kharcha.expensetracker` is not free on your account.

## Layout

```
src/app/            routes (expo-router): tabs, entry sheet, settings stack, deep link
src/db/             SQLite adapter, migrations, repositories, live-query hook
src/features/       add, entry, voice, extract (AI), history, insights, categories, settings, shortcut
src/shared/         tokens (light/dark), toast, shared components, utils
plugins/            Expo config plugin + Swift App Intent
tools/eval/         60-sentence accuracy check against Apple's on-device model
tools/icon/         app icon generator
```
