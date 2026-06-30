"use client";
import React, { useRef, useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { sendHbar } from "@/lib/wallet.magic";
import useMagicAuthStore from "@/lib/user.magic";

interface SendFormValues {
    recipientAddress: string;
    amount: string;
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

    // Read sender info from store for the "From" display
    const { userInfo, balance } = useMagicAuthStore();
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

    const handleClose = () => {
        reset();
        setTxStatus(null);
        setError(null);
        onClose();
    };

    const onSubmit = async (data: SendFormValues) => {
        setSending(true);
        setError(null);
        setTxStatus(null);
        try {
            const status = await sendHbar(data.recipientAddress, data.amount);
            setTxStatus(status); // e.g. "SUCCESS"
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
            contentLabel="Send HBAR"
            ariaHideApp={false}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 ref={subtitleRef} className="text-xl font-semibold text-white">
                    Send HBAR
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
                    <p className="text-gray-400 text-xs">{balance}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                    label="Amount (HBAR)"
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
                    disabled={sending}
                    className="w-full bg-[#fb4f1f] hover:bg-[#e04418] text-white font-medium"
                >
                    {sending ? "Sending…" : "Send"}
                </Button>
            </form>
        </Modal>
    );
};

export default SendModal;