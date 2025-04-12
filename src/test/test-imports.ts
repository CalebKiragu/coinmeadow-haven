
// This file contains common imports for test files
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Re-export everything so test files can import from this one file
export { vi, describe, it, expect, beforeEach, afterEach };
