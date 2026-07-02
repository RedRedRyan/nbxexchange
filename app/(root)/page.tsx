"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    NBXFEATURES,
    TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import Image from "next/image";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import {fetchAuthenticatedUser} from "@/lib/auth.magic";


const Home = () => {
    const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";
    const router = useRouter();

    const { isConnected, address, connect, disconnect, refreshSession } = useAuthStore();

    const { userInfo, balance, usdcBalance, usdtBalance, fetchUser, fetchBalances } = useUserStore();


    // Rehydrate auth state on mount
    useEffect(() => {
        fetchAuthenticatedUser();
    }, []);

    useEffect(() => {
        NBXFEATURES.forEach((_, index) => {
            const desc = document.getElementById(`desc-${index}`);
            if (desc) {
                desc.addEventListener("mouseenter", () => {
                    gsap.to(desc, {
                        duration: 2,
                        scrambleText: {
                            text: NBXFEATURES[index].description,
                            chars: "upperAndLowerCase",
                            revealDelay: 1.5,
                        },
                    });
                });
            }
        });
    }, []);

    const handleButtonClick = () => {
        if (isConnected) {
            router.push("/trade");
        } else {
            ;
        }
    };

    const buttonLabel = isConnected
        ? "Loading..."
        : isConnected
            ? "Trade"
            : "Connect Wallet";

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="grid gap-8 home-section">
                <div className="col-span-1  lg:col-span-2 rounded-3xl">
                    <div className="flex flex-row justify-between relative bg-cover bg-center"
                         style={{ backgroundImage: "url('/assets/images/worldmap.svg')" }}>
                        <h1 className="font-bold text-5xl md:text-[10vw] text-white">
                            Own <br /> The <br /> Future
                        </h1>

                        <div className="flex flex-col justify-between">
                            <div className="text-right font-mono text-sm">
                                <h1>
                                    Built on{" "}
                                    <a className="text-orange" href="https://hedera.com/">
                                        hedera
                                    </a>
                                </h1>
                            </div>
                            <div>
                                <Button
                                    className="bg-orange lg:w-48 w-40 h-12 text-md z-10"
                                    onClick={handleButtonClick}
                                    disabled={isConnected}
                                >
                                    {buttonLabel}
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="col-span-1 lg:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}
                    />
                </div>
            </section>

            <section className="grid w-full gap-8 home-section">
                <div className="h-full md:col-span-1 lg:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="h-full md:col-span-1 lg:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>
            <section className="grid w-full home-section">

                <div className="md-col-span lg:col-span-1">
                    <h1 className={"text-orange text-xl font-mono"}>Fixed Investments</h1>

                    <div className={"grid grid-cols-2 object-cover gap-3"}>
                        {NBXFEATURES.map((feature, index) => (
                            <div key={index} className="col-span-1">
                                <div className="relative p-6 backdrop-brightness-50 rounded-lg h-full bg-orange hover:bg-transparent flex flex-col items-center text-center group">
                                    <div className="feature-icon mb-4">
                                        <img
                                            src={feature.icon || "/placeholder.svg"}
                                            alt={feature.title}
                                            className="w-24 h-24"
                                        />
                                    </div>
                                    <h3 className="text-sm lg:text-xl font-bold mb-2 text-primary">
                                        {feature.title}
                                    </h3>

                                    {/* Hidden description overlay */}
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        id={`desc-${index}`}
                                    >
                                        {feature.description}
                                    </div>
                                </div>
                            </div>
                        ))}


                    </div>
                </div>
                <div className="md-col-span lg:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}stock-heatmap.js`}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="md-col-span lg:col-span-3">


                </div>

            </section>
            <section className="grid w-full gap-8 home-section">
                <div className="h-full md:col-span-1 lg:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="h-full md:col-span-1 lg:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>

        </div>
    );
};

export default Home;