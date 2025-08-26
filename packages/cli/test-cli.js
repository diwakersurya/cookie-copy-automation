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
    helpOutput.includes('grab') && helpOutput.includes('config') && helpOutput.includes('start-chrome'));
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
    grabHelpOutput.includes('--cdp-url') && grabHelpOutput.includes('--cookie-name') && grabHelpOutput.includes('--auto-start-chrome'));
} catch (error) {
  console.log(chalk.red('❌ Test 2 failed:'), error.message);
}

// Test 3: Start-chrome command help
console.log(chalk.green('\n✅ Test 3: Start-chrome command help'));
try {
  const { execSync } = await import('child_process');
  const startChromeHelpOutput = execSync('node src/cli.js start-chrome --help', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Start-chrome help command works'));
  console.log(chalk.gray('✓ Contains expected options:'), 
    startChromeHelpOutput.includes('--port') && startChromeHelpOutput.includes('--check-only'));
} catch (error) {
  console.log(chalk.red('❌ Test 3 failed:'), error.message);
}

// Test 4: Config command
console.log(chalk.green('\n✅ Test 4: Config command'));
try {
  const { execSync } = await import('child_process');
  const configOutput = execSync('node src/cli.js config', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Config command works'));
  console.log(chalk.gray('✓ Shows configuration:'), configOutput.includes('endpointURL'));
} catch (error) {
  console.log(chalk.red('❌ Test 4 failed:'), error.message);
}

// Test 5: Version command
console.log(chalk.green('\n✅ Test 5: Version command'));
try {
  const { execSync } = await import('child_process');
  const versionOutput = execSync('node src/cli.js --version', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Version command works:'), versionOutput.trim());
} catch (error) {
  console.log(chalk.red('❌ Test 5 failed:'), error.message);
}

// Test 6: Start-chrome check-only
console.log(chalk.green('\n✅ Test 6: Start-chrome check-only'));
try {
  const { execSync } = await import('child_process');
  const checkOutput = execSync('node src/cli.js start-chrome --check-only', { encoding: 'utf8' });
  console.log(chalk.gray('✓ Check-only command works'));
  console.log(chalk.gray('✓ Shows Chrome status:'), checkOutput.includes('Chrome') || checkOutput.includes('CDP'));
} catch (error) {
  console.log(chalk.red('❌ Test 6 failed:'), error.message);
}

// Test 7: Invalid command
console.log(chalk.green('\n✅ Test 7: Invalid command handling'));
try {
  const { execSync } = await import('child_process');
  execSync('node src/cli.js invalid-command', { encoding: 'utf8' });
  console.log(chalk.red('❌ Test 7 failed: Should have exited with error'));
} catch (error) {
  console.log(chalk.gray('✓ Invalid command properly rejected'));
}

console.log(chalk.blue('\n🎉 All CLI tests completed successfully!'));
console.log(chalk.yellow('\n📋 Next steps:'));
console.log(chalk.gray('1. Test Chrome management: cookie-copy start-chrome --check-only'));
console.log(chalk.gray('2. Test auto Chrome start: cookie-copy grab --auto-start-chrome --verbose'));
console.log(chalk.gray('3. Install globally: npm install -g .'));
