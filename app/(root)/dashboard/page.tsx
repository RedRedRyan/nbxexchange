"use client";

import React, {useEffect, useState} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBalance } from "@/lib/balanceChecker";
import { USDC } from "@/lib/constants";
import useMagicAuthStore, {magic} from "@/lib/user.magic";
import {Button} from "@/components/ui/button";
import SendModal from "@/components/SendModal";
import {IdCard, Mail, Send, History} from "lucide-react";
import CopyAddressButton from "@/components/CopyAddressButton";
import HistoryModal from "@/components/HistoryModal";





const Page = () => {
    const {
        isConnected,
        address,
        balance,
        userInfo,
        fetchAuthenticatedUser,
        fetchBalance,
    } = useMagicAuthStore();

    const [historyOpen, setHistoryOpen] = useState(false);
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

            <HistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
            {/* ── Dashboard grid ── */}
            <div className="dash-grid">
                {/* HBAR balance */}
                <div className="  md-col-span lg:col-span-1 rounded-3xl flex flex-col items-center ">
                    <div className={"   bg-orange w-full  "}>
                        <div className={"flex flex-row py-2 px-4 gap-5"}>
                            <Avatar className=" h-12 w-12 ">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="bg-orange text-black text-sm font-bold">
                                    {email[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className={"flex flex-col text-black "}>

                                    <div className={"flex  flex-row gap-2"}>
                                        <Mail height={16}/>
                                        <h1 className=" font-mono text-sm"> {email}</h1>
                                    </div>

                                <div className={"flex  flex-row gap-2"}>
                                    <IdCard height={20}/>
                                    <p>

                                        {userInfo?.wallets.hederaAccountId || "—"}
                                    </p>
                                </div>

                            </div>

                        </div>



                    </div>

                        <p className="text-2xl font-bold flex-center mt-4">{balance}</p>
                        <p className="font-mono text-xs opacity-60 bottom-0 right-0">{shortAddress}   <CopyAddressButton/></p>





                </div>
                <div className="md-col-span lg:col-span-2 rounded-3xl">
                    <div className=" p-4 rounded-xl flex flex-col items-center">

                        <p className=" font-bold"> QUICK ACTIONS</p>
                        <div className={"flex flex-row gap-2 mt-5"}>
                            <div className={"flex flex-row items-center gap-3"}>
                                <Button

                                    onClick={() => setSendOpen(true)}
                                    className={"qaction-btn"}

                                >
                                    <Send className={""} width={20} height={20} />
                                    <h1 className={'text-sm'}>send</h1>
                                </Button>
                                <Button

                                    onClick={() => setHistoryOpen(true)}
                                    className={"qaction-btn"}

                                >
                                    <History className={""} width={20} height={20} />
                                    <h1 className={'text-sm'}>past</h1>
                                </Button>

                            </div>




                        </div>
                    </div>
                </div>
                <div className=" p-4 rounded-xl flex flex-col items-center">
                    <p className="text-xs uppercase opacity-70 mb-1">HBAR Balance</p>
                    <p className="text-2xl font-bold">{balance}</p>
                    <div className={"flex flex-row gap-2"}>
                        <div className={"flex flex-col items-center"}>
                            <Button

                                onClick={() => setSendOpen(true)}
                                className={"qaction-btn"}

                            >
                                <Send className={""} width={20} height={20} />
                                </Button>
                            <h1 className={'text-sm'}>Send</h1>
                        </div>



                        <Button

                            onClick={() => setSendOpen(true)}
                        >Send</Button>
                        <Button

                            onClick={() => setSendOpen(true)}
                        >Send</Button>
                    </div>
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