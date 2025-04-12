
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Fix the global type declarations to avoid circular references
declare global {
  // Define vi as a simple object type without self-references
  var vi: {
    fn: (implementation?: any) => any;
    mock: (path: string, factory?: any) => any;
    spyOn: (object: any, method: string | number | symbol) => any;
    resetAllMocks: () => void;
  }
  
  // Define afterEach without self-reference
  var afterEach: (fn: () => void) => void;
  
  // Define expect without self-reference to testing-library
  var expect: any;
}

// Import the actual vi object from vitest
import { vi } from 'vitest';

// Make vi available globally
globalThis.vi = vi;

// Make afterEach available globally
globalThis.afterEach = afterEach;

// Make expect available globally
globalThis.expect = expect;

// Mock fetch for API testing
global.fetch = vi.fn();

// Clear the DOM after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
