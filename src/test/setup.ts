
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Fix the global type declarations to avoid circular references
declare global {
  // Define vi functions without self-references
  var vi: {
    fn: typeof vi.fn;
    mock: typeof vi.mock;
    spyOn: typeof vi.spyOn;
    resetAllMocks: typeof vi.resetAllMocks;
  }
  
  // Define afterEach without self-reference
  var afterEach: (fn: () => void) => void;
  
  // Define expect without self-reference
  var expect: {
    <T>(actual: T): import('@testing-library/jest-dom').JestMatchers<T>;
    extend: (matchers: any) => void;
  }
}

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
