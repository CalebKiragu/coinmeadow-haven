
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from 'wagmi';
import { createClient, configureChains } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { OnchainProvider } from "@coinbase/onchainkit";

// Create a query client
const queryClient = new QueryClient();

// Configure chains and providers for wagmi v1.x
const { provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()]
);

// Create wagmi client for v1.x
const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiConfig client={client}>
      <QueryClientProvider client={queryClient}>
        <OnchainProvider>
          {props.children}
        </OnchainProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
