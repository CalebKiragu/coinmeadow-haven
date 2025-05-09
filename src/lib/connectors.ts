import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { getEnvironmentConfig } from "./utils";

// Chain IDs: Ethereum Mainnet = 1, Base = 8453
const supportedChainIds = [
  getEnvironmentConfig().CHAIN_ID,
  getEnvironmentConfig().BASE_CHAIN_ID,
];

export const injected = new InjectedConnector({
  supportedChainIds, // Ethereum Mainnet and Base Mainnet
});

// Coinbase Wallet
export const coinbaseWallet = new WalletLinkConnector({
  url: getEnvironmentConfig().ETH_RPC_URL, // RPC URL (can be Alchemy/Infura for Base)
  appLogoUrl:
    "https://pt-landing-images.s3.us-east-1.amazonaws.com/croppedlogo-pt-png1024trans.png",
  darkMode: true,
  appName: "CoinDuka",
  supportedChainIds,
});
