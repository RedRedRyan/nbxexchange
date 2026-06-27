"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FooterLink from "@/components/forms/FooterLink";
import  {useAppKitAccount} from "@/context/appkit";
import {AppKitAccountButton, AppKitButton, AppKitConnectButton} from '@reown/appkit/react'
import {AppKitWalletButton} from "@reown/appkit-wallet-button/react";

const SignIn = () => {
  const router = useRouter();

  const { address, isConnected, isConnecting } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) {
      router.replace("/");
    }
  }, [isConnected, address, router]);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <p>Connecting wallet...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="form-title">Welcome</h1>

      <div className="space-y-5">

        <div className={"flex flex-col"}>
         <AppKitAccountButton/>
    <h1>Hello</h1>
        </div>



        <FooterLink
          text="Don't have an account?"
          linkText="Create an account"
          href="/sign-up"
        />
      </div>
    </>
  );
};

export default SignIn;
