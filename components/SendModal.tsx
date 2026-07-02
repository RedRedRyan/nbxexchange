"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { sendHbar, sendToken } from "@/lib/wallet.actions";
import { getUserTokensWithMetadata, fetchHbarBalance } from "@/lib/auth.magic"; // adjust path if these live elsewhere
import { useUserStore } from "@/store/user.store";

interface SendFormValues {
    recipientAddress: string;
    amount: string;
}

interface AssetOption {
    id: string; // "HBAR" or token_id
    label: string; // display symbol/name
    balanceLabel: string; // formatted balance for the "From" row
    decimals: number;
    isHbar: boolean;
}

interface SendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const customStyles: Modal.Styles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        background: "#0a0a0a",
        border: "1px solid #1f1f1f",
        borderRadius: "12px",
        padding: "32px",
        minWidth: "400px",
        color: "#ededed",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 50,
    },
};

const SendModal = ({ isOpen, onClose }: SendModalProps) => {
    const subtitleRef = useRef<HTMLHeadingElement>(null);
    const [txStatus, setTxStatus] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [assets, setAssets] = useState<AssetOption[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>("HBAR");

    const { userInfo } = useUserStore();
    const senderAddress =
        userInfo?.wallets.hederaAccountId ||
        userInfo?.wallets.hederaTestnetAddress ||
        "—";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SendFormValues>();

    // Load HBAR balance + all associated tokens whenever the modal opens
    useEffect(() => {
        if (!isOpen || !senderAddress || senderAddress === "—") return;

        let cancelled = false;
        setAssetsLoading(true);

        (async () => {
            try {
                const [hbarLabel, tokens] = await Promise.all([
                    fetchHbarBalance(senderAddress),
                    getUserTokensWithMetadata(senderAddress).catch(() => []), // no tokens is fine
                ]);

                if (cancelled) return;

                const hbarOption: AssetOption = {
                    id: "HBAR",
                    label: "HBAR",
                    balanceLabel: hbarLabel || "0 HBAR",
                    decimals: 8,
                    isHbar: true,
                };

                const tokenOptions: AssetOption[] = tokens.map((t) => ({
                    id: t.token_id,
                    label: `${t.symbol || t.name || t.token_id}`,
                    balanceLabel: `${(
                        Number(t.balance) / 10 ** (t.decimals ?? 0)
                    ).toString()} ${t.symbol || ""}`.trim(),
                    decimals: t.decimals ?? 0,
                    isHbar: false,
                }));

                setAssets([hbarOption, ...tokenOptions]);
            } finally {
                if (!cancelled) setAssetsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isOpen, senderAddress]);

    const selectedAsset =
        assets.find((a) => a.id === selectedAssetId) ??
        assets[0] ?? {
            id: "HBAR",
            label: "HBAR",
            balanceLabel: "–",
            decimals: 8,
            isHbar: true,
        };

    const handleClose = () => {
        reset();
        setTxStatus(null);
        setError(null);
        setSelectedAssetId("HBAR");
        onClose();
    };

    const onSubmit = async (data: SendFormValues) => {
        setSending(true);
        setError(null);
        setTxStatus(null);

        try {
            let status: string;
            if (selectedAsset.isHbar) {
                status = await sendHbar(data.recipientAddress, data.amount);
            } else {
                const rawAmount = Math.round(
                    Number(data.amount) * 10 ** selectedAsset.decimals
                );
                status = await sendToken(
                    selectedAsset.id,
                    data.recipientAddress,
                    rawAmount
                );
            }
            setTxStatus(status);
            reset();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Transaction failed");
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onAfterOpen={() => {
                if (subtitleRef.current) subtitleRef.current.style.color = "#fb4f1f";
            }}
            onRequestClose={handleClose}
            style={customStyles}
            contentLabel="Send"
            ariaHideApp={false}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 ref={subtitleRef} className="text-xl font-semibold text-white">
                    Send {selectedAsset.label}
                </h2>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                    ✕
                </button>
            </div>

            {/* Sender info */}
            <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                <span className="text-gray-400">From</span>
                <div className="text-right">
                    <p className="text-white font-mono text-xs">{senderAddress}</p>
                    <p className="text-gray-400 text-xs">{selectedAsset.balanceLabel}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/* Asset dropdown */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-400">Asset</label>
                    <Select
                        value={selectedAssetId}
                        onValueChange={setSelectedAssetId}
                        disabled={assetsLoading || assets.length === 0}
                    >
                        <SelectTrigger className="bg-white/5 border border-white/10 text-white text-sm">
                            <SelectValue
                                placeholder={assetsLoading ? "Loading assets…" : "Select asset"}
                            />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border border-white/10 text-white">
                            {assets.map((a) => (
                                <SelectItem
                                    key={a.id}
                                    value={a.id}
                                    className="text-sm focus:bg-white/10"
                                >
                                    {a.label}
                                    <span className="text-gray-400 ml-2 text-xs">
                                        {a.balanceLabel}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <InputField
                    name="recipientAddress"
                    label="Recipient address"
                    placeholder="0.0.XXXXX"
                    register={register}
                    validation={{ required: "Recipient address is required" }}
                    error={errors.recipientAddress}
                />

                <InputField
                    name="amount"
                    label={`Amount (${selectedAsset.label})`}
                    placeholder="0.0"
                    register={register}
                    validation={{
                        required: "Amount is required",
                        min: { value: 0.000001, message: "Amount must be greater than 0" },
                    }}
                    error={errors.amount}
                />

                {/* Transaction error */}
                {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {/* Transaction success */}
                {txStatus && (
                    <p className="text-sm text-green-400 bg-green-950/30 border border-green-800/40 rounded-lg px-3 py-2">
                        ✓ Transaction {txStatus}
                    </p>
                )}

                {/* Network fee */}
                <div className="flex items-center justify-between text-sm text-gray-400 px-1">
                    <span>Network fee</span>
                    <span>~0.0001 HBAR</span>
                </div>

                <Button
                    type="submit"
                    disabled={sending || assetsLoading}
                    className="w-full bg-[#fb4f1f] hover:bg-[#e04418] text-white font-medium"
                >
                    {sending ? "Sending…" : "Send"}
                </Button>
            </form>
        </Modal>
    );
};

export default SendModal;