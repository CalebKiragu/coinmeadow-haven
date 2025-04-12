
#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Running authentication tests...');
  execSync('vitest run src/components/auth/__tests__ src/utils/__tests__ src/hooks/__tests__', { stdio: 'inherit' });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
