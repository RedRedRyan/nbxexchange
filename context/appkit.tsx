"use client";

import { createAppKit, useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import type { ReactNode } from "react";
import type { CaipNetwork } from "@reown/appkit";
import {
  HederaAdapter,
  HederaChainDefinition,
  hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";

const isMainnet = process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet";
export const HEDERA_NETWORK: "mainnet" | "testnet" = isMainnet ? "mainnet" : "testnet";

const PROJECT_ID = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

const evmNetworks: CaipNetwork[] = isMainnet
    ? [HederaChainDefinition.EVM.Mainnet as CaipNetwork]
    : [HederaChainDefinition.EVM.Testnet as CaipNetwork];

const nativeNetworks: CaipNetwork[] = isMainnet
    ? [HederaChainDefinition.Native.Mainnet as CaipNetwork]
    : [HederaChainDefinition.Native.Testnet as CaipNetwork];

createAppKit({
  adapters: [
    new HederaAdapter({ projectId: PROJECT_ID, networks: nativeNetworks, namespace: hederaNamespace }),
    new HederaAdapter({ projectId: PROJECT_ID, networks: evmNetworks, namespace: "eip155" }),
  ],
  projectId: PROJECT_ID,
  metadata: {
    name: "NBX",
    description: "Nairobi Stock Exchange - SME Capital Markets",
    url: "https://nbx.co.ke",
    icons: [],
  },
  networks: [...nativeNetworks, ...evmNetworks] as [AppKitNetwork, ...AppKitNetwork[]],
  features: {
    analytics: true,
    email: true,
    socials: ["google", "apple", "github", "discord", "x", "facebook"],
    emailShowWallets: true,
  },
  themeMode: "dark",
});

export function AppKit({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { useAppKitProvider, useAppKitAccount };