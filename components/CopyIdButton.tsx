"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { copyHederaAccountId } from "@/lib/wallet.actions"; // <-- new import

type Props = {
    className?: string;
};

export default function CopyIdButton({ className }: Props) {
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        // call the wallet action to copy Hedera ID
        const ok = await copyHederaAccountId("hedera-account-id");
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Button onClick={handleClick} className={className ?? "bg-transparent text-orange"}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
        </Button>
    );
}
