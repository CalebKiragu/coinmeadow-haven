"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { getEnvironmentConfig } from "./utils";
import { WagmiProvider } from "wagmi";
import { queryClient, wagmiConfig } from "./wagmi";

// Remove the OnchainKitProvider since it's causing issues
export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={getEnvironmentConfig().onchainkitKey}
          chain={getEnvironmentConfig().base} // baseSepolia for testnet
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
