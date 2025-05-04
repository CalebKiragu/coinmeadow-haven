
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, base, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getEnvironmentConfig } from "./utils";
import { OnchainProvider } from "@coinbase/onchainkit";

// Create a query client
const queryClient = new QueryClient();

// Configure chains and providers for wagmi v1.x
// Using as const to ensure TypeScript treats the array as a readonly tuple
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, base, optimism, arbitrum] as const,
  [publicProvider()]
);

// Create wagmi config for the supported chains
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainProvider>
          {props.children}
        </OnchainProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
