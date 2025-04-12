
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Extend globalThis with type definitions
declare global {
  // eslint-disable-next-line no-var
  var vi: typeof vi;
  // eslint-disable-next-line no-var
  var afterEach: typeof afterEach;
  // eslint-disable-next-line no-var
  var expect: typeof expect;
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
