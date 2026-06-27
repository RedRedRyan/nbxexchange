"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppKitAccount } from "@/context/appkit";
import { getBalance } from "@/lib/balanceChecker";
import { USDC } from "@/lib/constants";

const Page = () => {
    const { account, address, isConnected } = useAppKitAccount();
    const [balance, setBalance] = useState<number | null>(null);
    const tokenID = USDC.tokenId;

    // With HederaAdapter + native namespace, address is "0.0.XXXXX" directly
    // With HederaAdapter + eip155 namespace, address is still "0x..." EVM
    // account.address is the one that carries the native Hedera ID when using hederaNamespace
    const accountId = address; // already "0.0.XXXXX" if connected via native adapter

    useEffect(() => {
        if (!accountId || !isConnected) return;
        const fetchBalance = async () => {
            try {
                const result = await getBalance(tokenID, accountId);
                setBalance(result ?? 0);
            } catch (err) {
                console.error("Error fetching balance:", err);
            }
        };
        fetchBalance();
    }, [tokenID, accountId, isConnected]);

    return (
        <section id="dash">
            <div className="flex-center flex-col mb-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-orange text-black text-sm font-bold">
                        {accountId?.split(".")[2]?.[0] ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <h1 className="mt-5">{accountId ?? "Not connected"}</h1>
                <h1>Profile</h1>
            </div>

            <div className="dash-grid">
                <div className="bg-orange ">
                    <p>Balance: {balance ?? "—"}</p>
                </div>
                <div className="bg-blue-500 ">

                </div>
                <div className="bg-green-500">!</div>

            </div>
        </section>
    );
};

export default Page;