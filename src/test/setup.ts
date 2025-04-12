
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Make vi, afterEach, and expect available globally
globalThis.vi = vi;
globalThis.afterEach = afterEach;
globalThis.expect = expect;

// Mock fetch for API testing
global.fetch = vi.fn();

// Clear the DOM after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
