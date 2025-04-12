
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Allow passing test pattern as argument
const testPattern = process.argv[2] || 'src/components/auth/__tests__';

try {
  console.log(`Running tests for: ${testPattern}`);
  
  // Check if test directory/files exist before running
  const testPath = path.resolve(process.cwd(), testPattern);
  if (!fs.existsSync(testPath)) {
    console.warn(`Warning: Test path '${testPattern}' does not exist.`);
    process.exit(0);
  }
  
  // Run tests with specified pattern
  execSync(`vitest run ${testPattern}`, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test' }
  });
  
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
