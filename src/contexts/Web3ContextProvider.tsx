import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  useAccount,
  useWalletClient,
  usePublicClient,
  useConnect,
  useDisconnect,
  useEnsName,
  useEnsAvatar,
  useChainId,
  useSwitchChain,
  Connector,
} from "wagmi";
import { useAppKit } from "@reown/appkit/react"; // Only provides open/close
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { resetWeb3Wallet, setWeb3Wallet } from "@/lib/redux/slices/web3Slice";
import { useToast } from "@/hooks/use-toast";
import { BigNumber } from "ethers";
import { ApiService } from "@/lib/services";

type WalletContextType = {
  address?: string;
  chainId?: number;
  ensName?: string;
  ensAvatar?: string;
  isConnected: boolean;
  connectionType: "wagmi" | "reown" | null;
  connectors: readonly Connector[];
  connect: ReturnType<typeof useConnect>["connect"];
  getBalance: () => Promise<any>;
  getGasPrice: () => Promise<any>;
  sendTransaction: (to: string, value: any) => Promise<string>;
  isPending: boolean;
  pendingConnector?: Connector;
  openReownModal: () => Promise<void>;
  switchNetwork: (chainId: number, chainName: string) => void;
  chains: ReturnType<typeof useSwitchChain>["chains"];
  depositAddress: string;
  previousAddresses: string[];
  disconnectAll: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export const Web3WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, connector, chain } = useAccount();
  const user = useAppSelector((state: any) => state.auth.user);
  const merchant = useAppSelector((state: any) => state.auth.merchant);
  const userIdentifier =
    user?.email || user?.phone || merchant?.email || merchant?.phone || "";
  const isMerchant = !!merchant;
  const chainId = useChainId();
  const chainClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const [depositAddress, setDepositAddress] = useState("");
  const [previousAddresses, setPreviousAddresses] = useState<string[]>([]);
  const { connect, connectors, status, data: pendingConnector } = useConnect();
  const ensName = useEnsName({ address });
  const ensAvatar = useEnsAvatar({ name: ensName.data });
  const { switchChain, chains, error, isPending } = useSwitchChain();
  const { open: openReownModal } = useAppKit();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { disconnect } = useDisconnect();

  const getDepositAddresses = async () => {
    // Fetch deposit address(es)
    const addresses = await ApiService.getDepositAddresses({
      userIdentifier,
      currency: "ETH",
      isMerchant,
    });
    // If there are previous addresses, use the first one as the current address
    if (addresses && addresses.length > 0) {
      setPreviousAddresses(addresses);
      setDepositAddress(addresses[0]);
    } else {
      // If no previous addresses, generate a new one
      const address = await ApiService.generateDepositAddress({
        userIdentifier,
        currency: "ETH",
        isMerchant,
        fresh: true,
      });
      if (address) {
        setDepositAddress(address);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to generate deposit address. Please try again later.",
        });
      }
    }
  };

  useEffect(() => {
    if (address && chainId) {
      dispatch(
        setWeb3Wallet({
          wallet: {
            address,
            chain: chain?.name,
            chainId,
            connectorName: connector?.name,
            connected: isConnected,
          },
        })
      );
    } else {
      dispatch(resetWeb3Wallet());
    }

    if (!depositAddress && previousAddresses?.length === 0)
      getDepositAddresses();
  }, [address, chainId, connector, depositAddress, previousAddresses]);

  const getBalance = async () => {
    if (!address) return;
    const balance = await chainClient.getBalance({ address });
    return BigNumber.from(balance.toString());
  };

  const getGasPrice = async () => {
    const gasPrice = await chainClient.getGasPrice();
    const gasEstimate = await chainClient.estimateGas(chain);
    return BigNumber.from(gasPrice.toString()).mul(
      BigNumber.from(gasEstimate.toString())
    );
  };

  const sendTransaction = async (to: string, value: any) => {
    if (!walletClient) return;
    const txHash = await walletClient.sendTransaction({
      account: address,
      to,
      value,
      chain,
      kzg: undefined,
    });
    return txHash;
  };

  const switchNetwork = (chainId: number, chainName: string) => {
    switchChain?.({ chainId });
    toast({
      title: "Chain switched successfully",
      description: `${chainName} is active.`,
    });
  };

  const disconnectAll = useCallback(() => {
    if (!isConnected) {
      dispatch(resetWeb3Wallet());
      return toast({
        title: "Disconnection failed",
        description: "No wallet connected",
        variant: "destructive",
      });
    }
    disconnect();
    dispatch(resetWeb3Wallet());
    toast({
      title: "Wallet disconnected",
      description: `Disconnected from ${connector?.name || "wallet"}`,
    });
  }, [isConnected, disconnect]);

  const contextValue = useMemo(
    () => ({
      address,
      chainId,
      ensName: ensName.data,
      ensAvatar: ensAvatar.data,
      isConnected,
      connectionType: isConnected ? ("wagmi" as const) : null,
      connectors,
      connect,
      getBalance,
      getGasPrice,
      sendTransaction,
      isPending,
      pendingConnector: pendingConnector as unknown as Connector | undefined,
      openReownModal,
      switchNetwork,
      chains,
      depositAddress,
      previousAddresses,
      disconnectAll,
    }),
    [
      address,
      chainId,
      ensName.data,
      ensAvatar.data,
      isConnected,
      connectors,
      connect,
      getBalance,
      getGasPrice,
      sendTransaction,
      isPending,
      pendingConnector,
      openReownModal,
      switchNetwork,
      chains,
      depositAddress,
      previousAddresses,
      disconnectAll,
    ]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
