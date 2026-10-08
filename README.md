# Expo OTA updates demo by HotCodePush

The demo app for [Expo OTA updates](https://hotcodepush.com/expo-ota-updates) with `@hotcodepush/expo-ota-updates`: one screen showing the bundle version, the current release, the device id, the last sync and the last rollback, a button that syncs now and one that opens the debug screen.

## Installation

```sh
nvm use
npm ci
npx expo prebuild
```

The native projects are not committed: `npx expo prebuild` generates `ios/` and `android/` with the SDK's config plugin, which wires the build step and the served bundle into them, and installs the pods.
`app.json` lists one more plugin, the demo's own under `plugins/`, which permits cleartext to the device test's local stack on Android.
The committed `hotcodepush.json` names a placeholder app: delete it and run `npx hotcodepush init`, which writes one that names yours.
Then run a release build: `npx expo run:ios --configuration Release` or `npx expo run:android --variant release`.
A release build bundles the JavaScript and runs the CLI's build step, which writes the resource file `hotcodepush.json` into the app; an Xcode archive or an Android release build also creates the store build's binary with its embedded bundle, so log in first with `npx hotcodepush login` or set `HOTCODEPUSH_TOKEN`.
Without a token, or with `HOTCODEPUSH_OFFLINE=1`, the build goes on without a channel and takes no updates; where `CI` is set, a missing token fails the build instead.
Point it at another host, the local stack or staging, by setting `HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` for the build.
A debug build is the development build, with `expo-dev-client`: `npm run ios` or `npm run android` builds it, `npm start` serves its JavaScript, and the build step writes its `hotcodepush.json` without an embedded bundle, so every sync answers `SKIPPED` with `BUILD_DEBUG`.

## Usage

Run the app once: it shows `v1` and the current release `embedded`.
Change `VERSION` in `App.tsx`, release with `npx hotcodepush release create`, which bundles each platform itself, tap "Sync now" and reopen the app to see the new label.

## Documentation

The SDK reference is at [hotcodepush.com/docs/expo](https://hotcodepush.com/docs/expo).

## Development

```sh
npm run lint        # Prettier
npm run typecheck   # TypeScript
npm run prebuild    # the native projects, generated without installing the pods
npm start           # the development server, for the development build
```

The flows in `maestro/` are the update lifecycle contract the monorepo's `e2e/` runner drives on the simulator and the emulator — the golden path, the broken release that rolls back, the revoke, the incompatible release, the debug screen whose shared report names that skip's code, the release a build that carries a public key refuses, unsigned or signed with a key it does not trust, and the signed release on a build that carries the app's public key, the release whose entry file registers no root, which ends the process and rolls back, and the debug build, whose sync answers `SKIPPED` with `BUILD_DEBUG`.
For each platform the runner generates the native project with `npx expo prebuild --platform <platform> --no-install`, installs the pods on iOS and builds the store build under a token, an archive on iOS and the release variant on Android, so the build step creates the binary.
By hand, install a release build, release `v2` with the CLI, then `maestro test -e EXPECTED_VERSION=v2 -e EXPECTED_RELEASE_NUMBER=1 maestro/golden-path.yaml`; each flow's header names what it expects.

## License

See [LICENSE](./LICENSE).
