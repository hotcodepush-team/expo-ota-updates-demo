# Expo OTA updates demo by HotCodePush

The demo app for [Expo OTA updates](https://hotcodepush.com/expo-ota-updates) with `@hotcodepush/expo-ota-updates`: one screen showing the bundle version, the current release, the device id, the last sync and the last rollback, a button that syncs now and one that opens the debug screen.

## Getting started

```sh
nvm use
npm ci
npx hotcodepush login
npx expo prebuild
npx expo run:ios --configuration Release      # or: npx expo run:android --variant release
```

The native projects are not committed: `npx expo prebuild` generates them with the SDK's config plugin and installs the pods.
The committed `hotcodepush.json` names a placeholder app; delete it and run `npx hotcodepush init` to name yours.
OTA updates are off in the development build, where the development server serves the JavaScript, so run a release build.
Every native build runs the CLI's build step, which writes `hotcodepush.json` into the app; an Xcode archive or an Android release build also registers the store build in HotCodePush.
Without a login the file names no channel and the app takes no updates.
Set `HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` for the build to point it at the local stack or staging.

## Usage

Run the app once: it shows `v1` and the current release `embedded`.
Change `VERSION` in `App.tsx`, release with `npx hotcodepush release create`, which bundles each platform itself, tap "Sync now" and reopen the app to see the new label.

## Development

```sh
npm run prebuild    # the native projects, without installing the pods
npm start           # the development server, for the development build
npm run ios         # the development build; npm run android for Android
npm run lint && npm run typecheck
npm run fmt         # run before every commit
```

The flows in `maestro/` are the update lifecycle contract the monorepo's `e2e/` runner drives on the simulator and the emulator; each flow's header names what it expects.
By hand: install a release build, release `v2`, then `maestro test -e EXPECTED_VERSION=v2 -e EXPECTED_RELEASE_NUMBER=1 maestro/golden-path.yaml`.
`CLAUDE.md` holds the native build commands and the wiring the plugin adds.

## Documentation

See [hotcodepush.com/docs/expo](https://hotcodepush.com/docs/expo).

## License

See [LICENSE](./LICENSE).
