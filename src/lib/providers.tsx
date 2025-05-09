"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getEnvironmentConfig } from "./utils";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

// Create a query client
const queryClient = new QueryClient();

export const getLibrary = (provider: any): Web3Provider => {
  return new Web3Provider(provider);
};

// Remove the OnchainKitProvider since it's causing issues
export function Providers(props: { children: ReactNode }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={getEnvironmentConfig().onchainkitApiKey}
          chain={getEnvironmentConfig().base} // baseSepolia for testing
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </Web3ReactProvider>
  );
}
