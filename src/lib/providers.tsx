"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { getEnvironmentConfig } from "./utils";

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={getEnvironmentConfig().onchainkitApiKey}
      chain={getEnvironmentConfig().base} // add baseSepolia for testing
    >
      {props.children}
    </OnchainKitProvider>
  );
}
