
"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getEnvironmentConfig } from "./utils";

// Create a query client
const queryClient = new QueryClient();

// Remove the OnchainKitProvider since it's causing issues
export function Providers(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
