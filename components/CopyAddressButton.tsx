"use client";

import { useState } from "react";
import useMagicAuthStore from "@/lib/user.magic";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

type Props = {
    which?: "evm" | "hedera";
    className?: string;
};

export default function CopyAddressButton({ which = "evm", className }: Props) {
    const copyAddress = useMagicAuthStore((s) => s.copyAddress);
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        const ok = await copyAddress(which);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // reset after 2s
        }
    };

    return (
        <Button onClick={handleClick} className={'bg-transparent text-orange'} >
            {copied ? (
                <Check className="w-4 h-4 mr-2" />
            ) : (
                <Copy className="w-4 h-4 mr-2" />
            )}

        </Button>
    );
}
