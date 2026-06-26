"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import {   hedera} from "@reown/appkit/networks";
import { type ReactNode } from "react";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

const metadata = {
  name: "NBX",
  description: "Tokenizing equities and bonds",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [ hedera],
  projectId,
  features: {
    analytics: true,
    socials:['x','google'],
    email:true,
    

  },
});

export function AppKit({ children }: { children: ReactNode }) {
  return <>{children}</>;
}