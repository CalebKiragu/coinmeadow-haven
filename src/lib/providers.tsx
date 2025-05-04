
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';
import { getEnvironmentConfig } from "./utils";
import { OnchainProvider } from "@coinbase/onchainkit";

// Create a query client
const queryClient = new QueryClient();

// Create public client for wagmi v2.x
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

// Create wagmi config for v2.x
const config = createConfig({
  publicClient,
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainProvider>
          {props.children}
        </OnchainProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
