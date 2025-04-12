
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/**/*'],
    },
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    typecheck: {
      tsconfig: './tsconfig.json',
      ignoreSourceErrors: true, // Ignore errors in source files
    },
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    css: false,
    // Only run test files that are explicitly specified
    passWithNoTests: true,
  },
});
