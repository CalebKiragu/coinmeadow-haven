
// Global declarations
declare namespace NodeJS {
  interface Global {
    // Add any global properties used in tests here
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
}

// Fix for __dirname in vite.config.ts
declare const __dirname: string;

// Add missing module declarations
declare module '@radix-ui/react-toast';
