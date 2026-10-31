const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');

// The device test runs against a local stack over plain HTTP.
// 10.0.2.2 is the host machine as the Android emulator sees it.
const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
        <domain includeSubdomains="false">localhost</domain>
    </domain-config>
</network-security-config>
`;

// iOS needs no change: the Info.plist that Expo generates already allows local networking.
module.exports = function withLocalStackCleartext(config) {
  return withAndroidManifest(
    withNetworkSecurityConfigFile(config),
    manifestConfig => {
      const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
        manifestConfig.modResults,
      );
      application.$['android:networkSecurityConfig'] =
        '@xml/network_security_config';
      return manifestConfig;
    },
  );
};

function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    dangerousConfig => {
      const xmlDirectoryPath = join(
        dangerousConfig.modRequest.platformProjectRoot,
        'app/src/main/res/xml',
      );
      mkdirSync(xmlDirectoryPath, { recursive: true });
      writeFileSync(
        join(xmlDirectoryPath, 'network_security_config.xml'),
        NETWORK_SECURITY_CONFIG,
      );
      return dangerousConfig;
    },
  ]);
}
