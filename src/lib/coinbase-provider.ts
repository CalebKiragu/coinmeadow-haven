// coinbase-provider.ts
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";
import { ethers } from "ethers";
import { getEnvironmentConfig } from "./utils";

const APP_NAME = "CoinDuka";
const APP_LOGO_URL =
  "https://pt-landing-images.s3.us-east-1.amazonaws.com/croppedlogo-pt-png1024trans.png"; // optional

export function getCoinbaseWalletProvider() {
  const coinbaseWalletSDK = new CoinbaseWalletSDK({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO_URL,
    darkMode: true,
  });
  const coinbaseProvider = coinbaseWalletSDK.makeWeb3Provider(
    getEnvironmentConfig().ETH_RPC_URL,
    getEnvironmentConfig().CHAIN_ID
  );
  const ethersProvider = new ethers.providers.Web3Provider(
    coinbaseProvider,
    "any"
  );
  return { coinbaseProvider, ethersProvider };
}
