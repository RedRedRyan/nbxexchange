"use client";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, arbitrum } from "@reown/appkit/networks";
import { type ReactNode } from "react";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!

const metadata = {
  name:"NBX",
  description: "My Website description",
  url: "https://mywebsite.com",
  icons: ["https://avatars.mywebsite.com/"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks: [mainnet, arbitrum],
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