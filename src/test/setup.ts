
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock fetch for API testing
vi.stubGlobal('fetch', vi.fn());

// Clear the DOM after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
