
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { getEnvironmentConfig } from "./utils";
import { OnchainProvider } from "@coinbase/onchainkit";

// Create a query client
const queryClient = new QueryClient();

// Configure chains and providers for wagmi v1.x
// Using only the mainnet for now to avoid type compatibility issues with other chains
const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

// Create wagmi config for v1.x
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
