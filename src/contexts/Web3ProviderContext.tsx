import React, { createContext, useContext, useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { getCoinbaseWalletProvider } from "@/lib/coinbase-provider";
import { getEnvironmentConfig } from "@/lib/utils";
import { useWeb3React } from "@web3-react/core";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useToast } from "@/hooks/use-toast";
import { resetWeb3Wallet, setWeb3Wallet } from "@/lib/redux/slices/web3Slice";
import { injected } from "@/lib/connectors";
import { WalletInfo, WalletType } from "./web3/types";

// detect if running in a browser environment
const isBrowser = typeof window !== "undefined";

interface Web3WalletContextProps {
  provider: Web3Provider | null;
  isConnecting: boolean;
  walletType: WalletType | null;
  showWalletSelector: boolean;
  setShowWalletSelector: any;
  web3WalletsList: any;
  anyWalletInstalled: boolean;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  handleConnect: () => void;
  handleWalletInstall: (url: string) => void;
}

const Web3WalletContext = createContext<Web3WalletContextProps>({
  provider: null,
  isConnecting: null,
  walletType: null,
  showWalletSelector: null,
  setShowWalletSelector: null,
  web3WalletsList: null,
  anyWalletInstalled: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  handleConnect: () => {},
  handleWalletInstall: () => {},
});

export const Web3WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { activate } = useWeb3React();
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [injectedProviders, setInjectedProviders] = useState<
    Record<WalletType, any>
  >({} as any);
  const [isConnecting, setIsConnecting] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<
    Record<WalletType, boolean>
  >({
    metamask: false,
    phantom: false,
    coinbase: true,
    trustWallet: false,
  });
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [anyWalletInstalled, setAnyWalletInstalled] = useState(false);
  const [isCoinbaseDetected, setIsCoinbaseDetected] = useState(true);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Check if wallets are available
  useEffect(() => {
    if (!isBrowser) return;
    const eth = (window as any).ethereum;
    if (!eth) return;
    const providers = eth?.providers || [eth];

    const { coinbaseProvider } = getCoinbaseWalletProvider();
    coinbaseProvider
      .request({ method: "eth_requestAccounts" })
      .then(() => setIsCoinbaseDetected(true))
      .catch(() => setIsCoinbaseDetected(false));

    const checkWalletAvailability = () => {
      const wallets = {
        metamask: !!eth.isMetaMask,
        phantom: !!eth.isPhantom,
        coinbase: isCoinbaseDetected,
        trustWallet: !!eth.isTrust,
      };
      setInstalledWallets(wallets);
      const hasAnyWallet = Object.values(wallets).some(Boolean);
      setAnyWalletInstalled(hasAnyWallet);
      // Add a class to document to allow styling based on wallet availability
      if (hasAnyWallet) {
        document.documentElement.classList.add("has-wallet");
      } else {
        document.documentElement.classList.remove("has-wallet");
      }
    };

    checkWalletAvailability();

    // Check again after a delay to catch late-loading extensions
    const timeoutId = setTimeout(checkWalletAvailability, 1000);

    // Listen for wallet injections that might happen after page load
    window.addEventListener("DOMContentLoaded", checkWalletAvailability);

    const detected: Record<WalletType, any> = {
      metamask: null,
      trustWallet: null,
      phantom: null,
      coinbase: null,
    };
    providers?.forEach((p: any) => {
      if (p.isMetaMask) detected.metamask = p;
      if (p.isPhantom) detected.phantom = p;
      if (p.isTrust) detected.trustWallet = p;
      if (p.isCoinbase) detected.coinbase = p;
    });
    setInjectedProviders(detected);

    return () => {
      window.removeEventListener("DOMContentLoaded", checkWalletAvailability);
      clearTimeout(timeoutId);
    };
  }, []);

  const web3WalletsList: WalletInfo[] = [
    {
      type: "metamask",
      name: "MetaMask",
      logo: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.0891 3L15.1521 9.58087L16.7343 5.51304L24.0891 3Z"
            fill="#E2761B"
            stroke="#E2761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.9043 3L12.7804 9.63478L11.2673 5.51304L3.9043 3Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.9543 18.1304L18.5977 21.8609L23.6455 23.3043L25.0938 18.2174L20.9543 18.1304Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.9126 18.2174L4.35216 23.3043L9.40868 21.8609L7.05216 18.1304L2.9126 18.2174Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.10432 12.0348L7.73475 14.1L12.7347 14.3478L12.563 8.8696L9.10432 12.0348Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.8891 12.0348L15.3934 8.81567L15.2891 14.3478L20.2891 14.1L18.8891 12.0348Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.4087 21.8609L12.4174 20.3044L9.83131 18.2522L9.4087 21.8609Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5783 20.3044L18.5957 21.8609L18.1652 18.2522L15.5783 20.3044Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      available: installedWallets.metamask,
      installUrl:
        "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
      bgColor: "#F6851B",
    },
    {
      type: "coinbase",
      name: "Coinbase Wallet",
      logo: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="28" height="28" rx="14" fill="#0052FF" />
          <path
            d="M14 6C9.58172 6 6 9.58172 6 14C6 18.4183 9.58172 22 14 22C18.4183 22 22 18.4183 22 14C22 9.58172 18.4183 6 14 6ZM11.4 17.075C10.0745 17.075 9 15.9975 9 14.675C9 13.3496 10.0745 12.275 11.4 12.275C12.7255 12.275 13.8 13.3496 13.8 14.675C13.8 15.9975 12.7255 17.075 11.4 17.075ZM16.6 17.075C15.2745 17.075 14.2 15.9975 14.2 14.675C14.2 13.3496 15.2745 12.275 16.6 12.275C17.9255 12.275 19 13.3496 19 14.675C19 15.9975 17.9255 17.075 16.6 17.075Z"
            fill="white"
          />
        </svg>
      ),
      available: installedWallets.coinbase,
      installUrl:
        "https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
      bgColor: "#0052FF",
    },
    {
      type: "phantom",
      name: "Phantom",
      logo: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="128" height="128" rx="64" fill="#AB9FF2" />
          <path
            d="M110.584 64.9142H99.142C99.142 41.7651 80.1749 23 56.7726 23C33.6533 23 14.8295 41.3577 14.405 64.0883C13.9658 87.7088 33.0569 107 56.7726 107H60.0629C60.9474 107 61.6663 106.287 61.6663 105.409V94.2237C61.6663 93.346 60.9474 92.6329 60.0629 92.6329H56.8439C41.171 92.6329 28.4363 79.9129 28.5789 64.3048C28.7215 49.1199 41.3135 36.8028 56.7013 36.8028C72.089 36.8028 84.6597 49.1199 84.6597 64.2649V105.409C84.6597 106.287 85.3786 107 86.2631 107H97.5387C98.4232 107 99.142 106.287 99.142 105.409V78.8852H110.584C111.469 78.8852 112.188 78.1722 112.188 77.2944V66.5049C112.188 65.6272 111.469 64.9142 110.584 64.9142Z"
            fill="white"
          />
        </svg>
      ),
      available: installedWallets.phantom,
      installUrl:
        "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
      bgColor: "#8A5FFF",
    },
    {
      type: "trustWallet",
      name: "Trust Wallet",
      logo: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="128" height="128" rx="64" fill="#3375BB" />
          <path
            d="M64 28L91 36.5C91 54.8333 89.6 71.3 85.5 81.5C81.4 91.7 73.5 99.2 64 102C54.5 99.2 46.6 91.7 42.5 81.5C38.4 71.3 37 54.8333 37 36.5L64 28Z"
            fill="white"
          />
        </svg>
      ),
      available: installedWallets.trustWallet,
      installUrl:
        "https://chromewebstore.google.com/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph",
      bgColor: "#3375BB",
    },
  ];

  const connectWallet = async (web3WalletType?: WalletType) => {
    setIsConnecting(true);

    const injectedProvider = injectedProviders[web3WalletType];
    if (web3WalletType !== "coinbase" && !injectedProvider) {
      console.warn(`${web3WalletType} not found`);
      return;
    }

    let result;
    if (web3WalletType === "coinbase") {
      try {
        const { coinbaseProvider } = getCoinbaseWalletProvider();
        await coinbaseProvider.request({ method: "eth_requestAccounts" });
        const ethersProvider = new Web3Provider(coinbaseProvider);
        const signer = ethersProvider.getSigner();
        const ethAddress = await signer.getAddress();
        result = ethAddress;

        dispatch(
          setWeb3Wallet({
            wallet: {
              address: ethAddress,
              chainId: getEnvironmentConfig().CHAIN_ID,
              connectorName: web3WalletType,
              connected: true,
            },
          })
        );
        setProvider(ethersProvider);
        setWalletType(web3WalletType);
      } catch (err) {
        console.error("Coinbase connection error:", err);
      }
    } else {
      try {
        // Temporarily override window.ethereum
        const originalProvider = (window as any).ethereum;
        (window as any).ethereum = injectedProvider;

        await activate(injected, undefined, true);
        console.log(`Connected to ${web3WalletType}`);

        const web3Provider = new Web3Provider(injectedProvider);
        const signer = web3Provider.getSigner();
        const ethAddress = await signer.getAddress();
        result = ethAddress;

        dispatch(
          setWeb3Wallet({
            wallet: {
              address: ethAddress,
              chainId: getEnvironmentConfig().CHAIN_ID,
              connectorName: web3WalletType,
              connected: true,
            },
          })
        );
        setProvider(web3Provider);
        setWalletType(web3WalletType);

        // Restore original provider
        (window as any).ethereum = originalProvider;
      } catch (err) {
        console.error(`Error connecting to ${web3WalletType}:`, err);
      }
    }

    if (result) {
      setIsConnecting(false);
      setShowWalletSelector(false);
      toast({
        title: "Wallet connected",
        description: `Connected to ${web3WalletType}`,
      });
    } else if (!anyWalletInstalled) {
      // If no wallet is available, suggest installing one
      setShowWalletSelector(true);
    } else {
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
    }
  };

  const handleConnect = () => {
    if (
      installedWallets.coinbase ||
      installedWallets.metamask ||
      installedWallets.phantom ||
      installedWallets.trustWallet
    ) {
      setShowWalletSelector(true);
    } else {
      connectWallet();
    }
  };

  const handleWalletInstall = (url: string) => {
    window.open(url, "_blank");
  };

  const disconnectWallet = () => {
    dispatch(resetWeb3Wallet());
    setProvider(null);
    setWalletType(null);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully",
    });
  };

  return (
    <Web3WalletContext.Provider
      value={{
        provider,
        isConnecting,
        walletType,
        showWalletSelector,
        setShowWalletSelector,
        web3WalletsList,
        anyWalletInstalled,
        connectWallet,
        disconnectWallet,
        handleConnect,
        handleWalletInstall,
      }}
    >
      {children}
    </Web3WalletContext.Provider>
  );
};

export const useWeb3Wallet = () => useContext(Web3WalletContext);
