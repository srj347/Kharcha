// Expo config plugin: adds the "Log Expense" App Intent (plugins/ios/
// LogExpenseIntent.swift) to the main app target. App Shortcuts must live in
// the app target to be found by the Shortcuts app.
const fs = require('fs');
const path = require('path');
const { IOSConfig, withDangerousMod, withXcodeProject } = require('expo/config-plugins');

const SWIFT_FILE = 'LogExpenseIntent.swift';

function withLogExpenseIntent(config) {
  config = withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(modConfig.modRequest.projectRoot);
      const source = path.join(modConfig.modRequest.projectRoot, 'plugins', 'ios', SWIFT_FILE);
      const target = path.join(modConfig.modRequest.platformProjectRoot, projectName, SWIFT_FILE);
      fs.copyFileSync(source, target);
      return modConfig;
    },
  ]);

  return withXcodeProject(config, (modConfig) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(modConfig.modRequest.projectRoot);
    const project = modConfig.modResults;
    const filepath = `${projectName}/${SWIFT_FILE}`;
    if (!project.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath, groupName: projectName, project });
    }
    return modConfig;
  });
}

module.exports = withLogExpenseIntent;
