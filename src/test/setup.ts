
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Make vi, afterEach, and expect available globally
// We need to use declaration merging here with globalThis
(globalThis as any).vi = vi;
(globalThis as any).afterEach = afterEach;
(globalThis as any).expect = expect;

// Mock fetch for API testing
globalThis.fetch = vi.fn();

// Clear the DOM after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
