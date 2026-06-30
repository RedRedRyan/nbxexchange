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
import useMagicAuthStore from "@/lib/auth.magic";

const Home = () => {
    const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";
    const router = useRouter();

    const { isConnected, address, isLoading, connectWallet, fetchAuthenticatedUser } =
        useMagicAuthStore();

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
                            revealDelay: 0.5,
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
            connectWallet();
        }
    };

    const buttonLabel = isLoading
        ? "Loading..."
        : isConnected
            ? "Trade"
            : "Connect Wallet";

    return (
        <div className="flex min-h-screen home-wrapper">
            <section className="grid w-full gap-8 home-section">
                <div className="md-col-span lg:col-span-2 rounded-3xl">
                    <div className="flex flex-row justify-between">
                        <Image
                            className="absolute object-cover -z-10 opacity-50"
                            src="/assets/images/worldmap.svg"
                            width={800}
                            height={800}
                            alt="World Map"
                        />
                        <h1 className="font-bold text-6xl md:text-[10vw] text-white">
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
                                    disabled={isLoading}
                                >
                                    {buttonLabel}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;