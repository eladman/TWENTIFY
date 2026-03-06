/**
 * Generates React Native codegen artifacts for iOS.
 *
 * expo prebuild's `pod install` step fails because the RN codegen script
 * can't read the RN config without @react-native-community/cli.
 * This script pre-generates the codegen output so `pod install` can
 * be run with RCT_SKIP_CODEGEN=1.
 *
 * Usage:
 *   node scripts/fix-codegen.js
 *   cd ios && RCT_SKIP_CODEGEN=1 pod install
 */

const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'ios', 'build', 'generated', 'ios');

// Ensure the ios directory exists (prebuild must have run first)
if (!fs.existsSync(path.join(projectRoot, 'ios'))) {
  console.error('Error: ios/ directory not found. Run "npx expo prebuild" first (it will fail at pod install — that is expected).');
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const { execute } = require(path.join(
  projectRoot,
  'node_modules',
  'react-native',
  'scripts',
  'codegen',
  'generate-artifacts-executor',
  'index.js',
));

// Pass 'ios' as baseOutputPath so the executor computes ios/build/generated/ios
execute(projectRoot, 'ios', 'ios', 'app', true);
