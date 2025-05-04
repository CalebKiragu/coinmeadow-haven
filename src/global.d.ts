
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

// Add specific sub-module declarations for @coinbase/onchainkit
declare module '@coinbase/onchainkit/wallet';
declare module '@coinbase/onchainkit/identity';
declare module '@coinbase/onchainkit' {
  export const OnchainProvider: React.FC<{children: React.ReactNode}>;
  export const useWalletClient: () => any;
}

// Add declarations for test-related globals
interface Window {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
  // Extended wallet declarations - ensure consistency
  ethereum?: any;
  phantom?: {
    ethereum?: any;
    solana?: any;
    isPhantom?: boolean;
  };
  coinbaseWalletExtension?: any;
  ethers?: any;
}

interface GlobalThis {
  fetch: any;
  vi: any;
  afterEach: any;
  expect: any;
}

// Tell TypeScript about the TradingView global
interface Window {
  TradingView: TradingViewWidget;
}

// Supporting type declarations for wagmi v2.x
declare module 'viem' {
  interface Chain {
    // Add any missing properties for viem chain compatibility
  }
}
