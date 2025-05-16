import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  base,
  baseSepolia,
  sepolia,
  AppKitNetwork,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient } from "@tanstack/react-query";

// Define project ID from Reown Cloud
const projectId = "a42df26633e9817814b66a47f7e3d656";

// Define metadata (optional)
const metadata = {
  name: "CoinDuka by Pesa Token",
  description: "Seamless crypto infrastructure",
  url: "https://duka.pesatoken.org",
  icons: [
    "https://pt-landing-images.s3.us-east-1.amazonaws.com/croppedlogo-pt.jpeg",
  ],
};

// Define the networks you want to support
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  base,
  baseSepolia,
  sepolia,
];

// Instantiate the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Set to true if using Server-Side-Rendering(SSR)
});

// Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
});

// Export the necessary configurations
export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const queryClient = new QueryClient();
