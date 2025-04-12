
/// <reference types="vitest" />

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toBeVisible(): R;
  toHaveTextContent(text: string): R;
  toHaveClass(className: string): R;
  toHaveAttribute(attr: string, value?: string): R;
  toBeDisabled(): R;
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }

  // Make vi available globally
  const vi: typeof import('vitest')['vi'];
}

export {};
