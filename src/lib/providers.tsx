
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, base, optimism, arbitrum } from 'wagmi/chains';
import { getEnvironmentConfig } from "./utils";

// Create a query client
const queryClient = new QueryClient();

// Create wagmi config for the supported chains
const config = createConfig({
  chains: [mainnet, base, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
