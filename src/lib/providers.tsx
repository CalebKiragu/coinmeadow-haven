
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { OnchainProvider } from "@coinbase/onchainkit";

// Create a query client
const queryClient = new QueryClient();

// Create wagmi config for v2.x
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  },
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
