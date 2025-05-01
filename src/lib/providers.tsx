
"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { getEnvironmentConfig } from "./utils";

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={getEnvironmentConfig().onchainkitApiKey}
      chain={getEnvironmentConfig().base} // using the chain from environment config
    >
      {props.children}
    </OnchainKitProvider>
  );
}
