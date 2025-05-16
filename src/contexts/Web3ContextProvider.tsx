import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
  useEffect,
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
import { useAppDispatch } from "@/lib/redux/hooks";
import { resetWeb3Wallet, setWeb3Wallet } from "@/lib/redux/slices/web3Slice";
import { useToast } from "@/hooks/use-toast";
import { BigNumber } from "ethers";

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
  disconnectAll: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export const Web3WalletProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, connector, chain } = useAccount();
  const chainId = useChainId();
  const chainClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { connect, connectors, status, data: pendingConnector } = useConnect();
  const ensName = useEnsName({ address });
  const ensAvatar = useEnsAvatar({ name: ensName.data });
  const { switchChain, chains, error, isPending } = useSwitchChain();
  const { open: openReownModal } = useAppKit();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { disconnect } = useDisconnect();

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
  }, [address, chainId, connector]);

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
