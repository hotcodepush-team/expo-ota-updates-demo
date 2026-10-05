const { withPodfile } = require('expo/config-plugins');

const POST_INSTALL_LINE = '  post_install do |installer|';

// Xcode 27 builds no simulator target below iOS 15. React Native raises each pod's own target to its floor but not the
// resource bundle beside it, and HotCodePushProtocol's carries the core's iOS 13: it follows the app's floor here.
const RESOURCE_BUNDLE_FLOOR = `    installer.pods_project.targets.each do |target|
      next unless target.name.start_with?('HotCodePushProtocol')
      target.build_configurations.each do |build_configuration|
        build_configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = min_ios_version_supported
      end
    end`;

module.exports = function withProtocolPodIosFloor(config) {
  return withPodfile(config, podfileConfig => {
    const podfile = podfileConfig.modResults.contents;
    if (!podfile.includes(RESOURCE_BUNDLE_FLOOR)) {
      podfileConfig.modResults.contents = podfile.replace(
        POST_INSTALL_LINE,
        `${POST_INSTALL_LINE}\n${RESOURCE_BUNDLE_FLOOR}`,
      );
    }
    return podfileConfig;
  });
};
