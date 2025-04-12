
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupFetch } from 'vi-fetch';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Setup vi-fetch for mocking API responses
setupFetch();

// Clear the DOM after each test
afterEach(() => {
  cleanup();
});
