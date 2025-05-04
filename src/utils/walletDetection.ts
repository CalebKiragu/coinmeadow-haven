
/**
 * Utility functions for wallet detection and connection
 */

// Detect if a wallet is installed and available
export const detectWallets = (): Record<string, boolean> => {
  if (typeof window === "undefined") {
    return {
      metamask: false,
      phantom: false,
      coinbase: false,
    };
  }

  console.log("Detecting wallet availability...");
  
  // Improved MetaMask detection
  const hasMetaMask = () => {
    const detected = typeof window.ethereum !== 'undefined' && 
      (window.ethereum.isMetaMask || 
      (window.ethereum.providers && 
        window.ethereum.providers.some((p: any) => p.isMetaMask)));
    
    console.log("MetaMask detected:", detected);
    return detected;
  };
  
  // Enhanced Phantom detection with both Ethereum and Solana support check
  const hasPhantom = () => {
    const detected = typeof window.phantom !== 'undefined' && 
      (!!window.phantom.ethereum || 
       !!window.phantom.solana ||
       !!window.phantom.isPhantom);
    
    console.log("Phantom detected:", detected);
    return detected;
  };
  
  // Improved Coinbase detection
  const hasCoinbase = () => {
    const detected = 
      // Direct extension detection
      !!window.coinbaseWalletExtension || 
      // Through ethereum provider
      !!window.ethereum?.isCoinbaseWallet ||
      // Through providers array
      !!window.ethereum?.providers?.find((p: any) => p.isCoinbaseWallet);
    
    console.log("Coinbase detected:", detected);
    return detected;
  };
  
  const wallets = {
    metamask: hasMetaMask(),
    phantom: hasPhantom(),
    coinbase: hasCoinbase()
  };
  
  console.log("Detected wallets:", wallets);
  return wallets;
};

// Get provider from a specific wallet
export const getWalletProvider = (walletType: string) => {
  if (typeof window === "undefined") return null;

  switch (walletType) {
    case 'metamask':
      // Try ethereum object first
      if (window.ethereum?.isMetaMask) {
        return window.ethereum;
      }
      // Check for MetaMask in providers array
      if (window.ethereum?.providers) {
        return window.ethereum.providers.find((p: any) => p.isMetaMask);
      }
      break;
      
    case 'phantom':
      // Prioritize Ethereum provider for Phantom
      if (window.phantom?.ethereum) {
        return window.phantom.ethereum;
      }
      // Fallback to Solana provider
      if (window.phantom?.solana) {
        return window.phantom.solana;
      }
      break;
      
    case 'coinbase':
      // Direct extension access
      if (window.coinbaseWalletExtension) {
        return window.coinbaseWalletExtension;
      }
      // Through ethereum provider
      if (window.ethereum?.isCoinbaseWallet) {
        return window.ethereum;
      }
      // Check providers array
      if (window.ethereum?.providers) {
        return window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      }
      break;
  }
  
  return null;
};
