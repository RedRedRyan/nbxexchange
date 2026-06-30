"use client";

import React, {useEffect, useState} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBalance } from "@/lib/balanceChecker";
import { USDC } from "@/lib/constants";
import useMagicAuthStore, {magic} from "@/lib/user.magic";
import {Button} from "@/components/ui/button";
import SendModal from "@/components/SendModal";





const Page = () => {
    const {
        isConnected,
        address,
        balance,
        userInfo,
        fetchAuthenticatedUser,
        fetchBalance,
    } = useMagicAuthStore();


    const [sendOpen, setSendOpen] = useState(false);
    const email = userInfo?.email ?? "—";
    const initials = email !== "—" ? email.slice(0, 2).toUpperCase() : "?";

    // Truncate EVM address for display: 0x1234...abcd
    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "—";



    // Rehydrate session on mount
    useEffect(() => {
        fetchAuthenticatedUser();
    }, []);

    return (
        <section id="dash">
            {/* ── Avatar + identity ── */}
            <div className="flex-center flex-col mb-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-orange text-black text-sm font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <h1 className="mt-5 font-mono text-sm">{email}</h1>
                <p className="font-mono text-xs opacity-60">{shortAddress}</p>

            </div>

            {/* ── Dashboard grid ── */}
            <div className="dash-grid">
                {/* HBAR balance */}
                <div className="bg-orange p-4 rounded-xl">
                    <p className="text-xs uppercase opacity-70 mb-1">HBAR Balance</p>
                    <p className="text-2xl font-bold">{balance}</p>
                </div>

                {/* Full address */}
                <div className="bg-blue-500 p-4 rounded-xl">
                    <p className="text-xs uppercase opacity-70 mb-1">Wallet Address</p>
                    <p className="text-sm font-mono break-all">{address || "—"}</p>
                    <p className="text-xs uppercase opacity-70 mb-1">Hedera Account</p>
                    <p className="text-sm font-mono">
                        {userInfo?.wallets.hederaAccountId || "—"}
                    </p>
                </div>

                {/* Hedera account ID */}
                <div className="bg-green-500 p-4 rounded-xl">


                    <Button

                        onClick={() => setSendOpen(true)}
                    >Send</Button>
                    <SendModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />
                </div>
            </div>
        </section>
    );
};

export default Page;