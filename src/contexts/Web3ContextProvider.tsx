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
import { useXMTP } from "./xmtp/useXMTP";
import { Address, formatUnits, getAddress } from "viem";
import { getEnvironmentConfig } from "@/lib/utils";

export type TokenSymbol = "USDC" | "USDT" | "DAI" | "WBTC" | "WETH";

export const erc20ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

type Token = {
  symbol: TokenSymbol;
  address: {
    base?: string;
    eth: string;
  };
  decimals: number;
};

export type BalancesResult = {
  [symbol: string]: number;
} & {
  total: number;
};

export const SUPPORTED_WEB3 = [
  "base",
  "eth",
  // "usdc",
  // "usdt",
  // "dai",
  // "wbtc",
  // "weth",
];

const ERC20_TOKENS: Token[] = [
  {
    symbol: "USDC",
    address: getEnvironmentConfig().tokenAddress().usdc,
    decimals: 6,
  },
  {
    symbol: "USDT",
    address: getEnvironmentConfig().tokenAddress().usdt,
    decimals: 6,
  },
  {
    symbol: "DAI",
    address: getEnvironmentConfig().tokenAddress().dai,
    decimals: 6,
  },
  {
    symbol: "WBTC",
    address: getEnvironmentConfig().tokenAddress().wbtc,
    decimals: 6,
  },
  {
    symbol: "WETH",
    address: getEnvironmentConfig().tokenAddress().weth,
    decimals: 6,
  },
];

type WalletContextType = {
  address?: string;
  chainId?: number;
  ensName?: string;
  ensAvatar?: string;
  isConnected: boolean;
  connectionType: "wagmi" | "reown" | null;
  connectors: readonly Connector[];
  connect: ReturnType<typeof useConnect>["connect"];
  getBalance: (
    address: string,
    tokenAddress?: string,
    tokenSymbol?: TokenSymbol
  ) => Promise<BalancesResult>;
  getDecimals: (tokenAddress: Address) => Promise<any>;
  getGasPrice: () => Promise<any>;
  sendTransaction: (to: string, value: any) => Promise<string>;
  sendERC20: (
    to: string,
    amount: bigint,
    tokenAddress?: string,
    tokenSymbol?: TokenSymbol
  ) => Promise<any>;
  isPending: boolean;
  pendingConnector?: Connector;
  openReownModal: () => Promise<void>;
  switchNetwork: (chainId: number, chainName: string) => void;
  chains: ReturnType<typeof useSwitchChain>["chains"];
  depositAddress: string;
  previousAddresses: string[];
  disconnectAll: () => void;
  conversation?: any;
  startConversation: (peerAddress: string) => Promise<void>;
  resetConversation: () => void;
  messages: any[];
  sendMessage: (text: string) => Promise<void>;
  isXMTPConnected: boolean;
  xmtpLoading: boolean;
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
  const {
    conversation,
    startConversation,
    resetConversation,
    sendMessage,
    messages,
    isXMTPConnected,
    xmtpLoading,
  } = useXMTP();

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

  const getBalance = async (
    address: string,
    tokenAddress?: string, // if undefined, fetch native balance
    tokenSymbol?: TokenSymbol
  ): Promise<BalancesResult> => {
    const balances: BalancesResult = { total: 0 };
    if (!address) return;

    const safeWalletAddress = getAddress(address);
    const updateNativeBalance = async () => {
      // Native balance (ETH, Base, etc.)
      const nativeBalance = await chainClient.getBalance({ address });
      const nativeFloat = parseFloat(formatUnits(nativeBalance, 18));
      const normalizedKey = chain?.name.replace(/\s+/g, "_"); // 'Base Sepolia' → 'Base_Sepolia'
      balances[normalizedKey] = nativeFloat;
      balances.total += nativeFloat;
      // console.log("native >> ", balances);
    };

    if (!tokenAddress) {
      await updateNativeBalance();
      return balances;
    } else if (tokenAddress === "all") {
      await updateNativeBalance();

      // Fetch ERC-20 balances
      for (const token of ERC20_TOKENS) {
        try {
          const chainAddress =
            chain.id === 1 || chain.id === 11155111
              ? token.address.eth
              : token.address.base;
          // Skip if there's no address for this chain
          if (!chainAddress) {
            console.warn(
              `No address for ${token.symbol} on chain ${chain.name}`
            );
            balances[token.symbol] = 0;
            continue;
          }

          const safeAddress = getAddress(chainAddress);
          // console.log(
          //   `reading ${chain.name} ${token.symbol} >>> `,
          //   safeAddress,
          //   safeWalletAddress
          // );

          const balance = await chainClient.readContract({
            address: safeAddress,
            abi: erc20ABI,
            functionName: "balanceOf",
            args: [safeWalletAddress],
          });

          const tokenFloat = parseFloat(
            formatUnits(balance as bigint, token.decimals)
          );
          balances[token.symbol] = tokenFloat;
          balances.total += tokenFloat;
        } catch (err) {
          // TO FIX: ERC-20 contract management

          // console.warn(
          //   `Failed to fetch ${token.symbol} balance on ${chain.name}:`,
          //   err
          // );
          balances[token.symbol] = 0;
        }
      }
      return balances;
    } else {
      // ERC-20 token balance
      const safeAddress = getAddress(tokenAddress);
      const balance = await chainClient.readContract({
        address: safeAddress,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [safeWalletAddress],
      });
      const tokenFloat = parseFloat(formatUnits(balance as bigint, 6));
      balances[tokenSymbol] = tokenFloat;
      balances.total += tokenFloat;
      return balances;
    }
  };

  const getDecimals = async (tokenAddress: string) => {
    const safeAddress = getAddress(tokenAddress);

    return await chainClient.readContract({
      address: safeAddress,
      abi: erc20ABI,
      functionName: "decimals",
    });
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

  const sendERC20 = async (
    to: string,
    amount: bigint, // in base units (e.g. 1 USDC = 1000000 if 6 decimals)
    tokenAddress?: string,
    tokenSymbol?: TokenSymbol
  ) => {
    if (!walletClient) return;
    if (!tokenAddress && !tokenSymbol) return;

    let chainAddress;
    if (tokenSymbol)
      chainAddress = ERC20_TOKENS.find(
        (token) => token.symbol.toLowerCase() === tokenSymbol.toLowerCase()
      );
    return await walletClient.writeContract({
      address: `0x${tokenAddress?.slice(2) || chainAddress.slice(2)}`,
      abi: erc20ABI,
      functionName: "transfer",
      args: [to, amount],
    });
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
      getDecimals,
      getGasPrice,
      sendTransaction,
      sendERC20,
      isPending,
      pendingConnector: pendingConnector as unknown as Connector | undefined,
      openReownModal,
      switchNetwork,
      chains,
      depositAddress,
      previousAddresses,
      disconnectAll,
      conversation,
      startConversation,
      resetConversation,
      sendMessage,
      messages,
      isXMTPConnected,
      xmtpLoading,
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
      getDecimals,
      getGasPrice,
      sendTransaction,
      sendERC20,
      isPending,
      pendingConnector,
      openReownModal,
      switchNetwork,
      chains,
      depositAddress,
      previousAddresses,
      disconnectAll,
      conversation,
      startConversation,
      resetConversation,
      sendMessage,
      messages,
      isXMTPConnected,
      xmtpLoading,
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
