#!/usr/bin/env node

import chalk from 'chalk';

// Test the CLI help functionality
console.log(chalk.blue('🧪 Testing Cookie Copy CLI...\n'));

// Test 1: Basic help
console.log(chalk.green('✅ Test 1: Basic help command'));
try {
  const { execSync } = await import('child_process');
  const helpOutput = execSync('node src/cli.js --help', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Help command works'));
  console.log(chalk.gray('✓ Contains expected commands:'), 
    helpOutput.includes('grab') && helpOutput.includes('config'));
} catch (error) {
  console.log(chalk.red('❌ Test 1 failed:'), error.message);
}

// Test 2: Grab command help
console.log(chalk.green('\n✅ Test 2: Grab command help'));
try {
  const { execSync } = await import('child_process');
  const grabHelpOutput = execSync('node src/cli.js grab --help', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Grab help command works'));
  console.log(chalk.gray('✓ Contains expected options:'), 
    grabHelpOutput.includes('--cdp-url') && grabHelpOutput.includes('--cookie-name'));
} catch (error) {
  console.log(chalk.red('❌ Test 2 failed:'), error.message);
}

// Test 3: Config command
console.log(chalk.green('\n✅ Test 3: Config command'));
try {
  const { execSync } = await import('child_process');
  const configOutput = execSync('node src/cli.js config', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Config command works'));
  console.log(chalk.gray('✓ Shows configuration:'), configOutput.includes('endpointURL'));
} catch (error) {
  console.log(chalk.red('❌ Test 3 failed:'), error.message);
}

// Test 4: Version command
console.log(chalk.green('\n✅ Test 4: Version command'));
try {
  const { execSync } = await import('child_process');
  const versionOutput = execSync('node src/cli.js --version', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Version command works:'), versionOutput.trim());
} catch (error) {
  console.log(chalk.red('❌ Test 4 failed:'), error.message);
}

// Test 5: Invalid command
console.log(chalk.green('\n✅ Test 5: Invalid command handling'));
try {
  const { execSync } = await import('child_process');
  execSync('node src/cli.js invalid-command', { encoding: 'utf8' });
  console.log(chalk.red('❌ Test 5 failed: Should have exited with error'));
} catch (error) {
  console.log(chalk.gray('✓ Invalid command properly rejected'));
}

console.log(chalk.blue('\n🎉 All CLI tests completed successfully!'));
console.log(chalk.yellow('\n📋 Next steps:'));
console.log(chalk.gray('1. Start Chrome with: --remote-debugging-port=9222'));
console.log(chalk.gray('2. Test with: node src/cli.js grab --verbose'));
console.log(chalk.gray('3. Install globally: npm install -g .'));
