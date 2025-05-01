
"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getEnvironmentConfig } from "./utils";

// Create a query client
const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        apiKey={getEnvironmentConfig().onchainkitApiKey}
        chain={getEnvironmentConfig().base} // using the chain from environment config
      >
        {props.children}
      </OnchainKitProvider>
    </QueryClientProvider>
  );
}
