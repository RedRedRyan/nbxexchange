"use client";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import useMagicAuthStore from "@/lib/user.magic";

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MirrorTransfer {
    account: string;
    amount: number;
}

interface MirrorTransaction {
    transaction_id: string;
    name: string;
    consensus_timestamp: string;
    transfers: MirrorTransfer[];
    result: string;
}

interface TxRow {
    id: string;
    type: string;
    time: string;
    content: string;
    status: string;
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
        minWidth: "480px",
        maxWidth: "640px",
        color: "#ededed",
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 50,
    },
};

// Hedera consensus timestamps are "seconds.nanoseconds"
function formatTimestamp(ts: string): string {
    const [seconds] = ts.split(".");
    const date = new Date(Number(seconds) * 1000);
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatType(name: string): string {
    // e.g. "CRYPTOTRANSFER" -> "Crypto Transfer"
    return name
        .toLowerCase()
        .split("")
        .reduce((acc, char, i) => {
            if (i === 0) return char.toUpperCase();
            return acc + char;
        }, "")
        .replace(/transfer/i, " Transfer")
        .trim();
}

function summarizeContent(accountId: string, transfers: MirrorTransfer[]): string {
    if (!transfers || transfers.length === 0) return "—";

    const mine = transfers.find((t) => t.account === accountId);
    if (!mine) return "—";

    const hbar = (mine.amount / 1e8).toFixed(4);
    if (mine.amount > 0) {
        const sender = transfers.find((t) => t.amount < 0 && t.account !== accountId);
        return `Received ${hbar} HBAR${sender ? ` from ${sender.account}` : ""}`;
    } else if (mine.amount < 0) {
        const receiver = transfers.find((t) => t.amount > 0 && t.account !== accountId);
        return `Sent ${Math.abs(Number(hbar))} HBAR${receiver ? ` to ${receiver.account}` : ""}`;
    }
    return "0 HBAR";
}

const HistoryModal = ({ isOpen, onClose }: HistoryModalProps) => {
    const { userInfo } = useMagicAuthStore();
    const accountId =
        userInfo?.wallets.hederaAccountId || userInfo?.wallets.hederaTestnetAddress;

    const [transactions, setTransactions] = useState<TxRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !accountId) return;

        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `https://testnet.mirrornode.hedera.com/api/v1/transactions?account.id=${accountId}&limit=5&order=desc`
                );
                if (!res.ok) throw new Error("Failed to fetch transaction history");

                const data = await res.json();
                const txs: MirrorTransaction[] = data?.transactions ?? [];

                const rows: TxRow[] = txs.map((tx) => ({
                    id: tx.transaction_id,
                    type: formatType(tx.name ?? "TRANSFER"),
                    time: formatTimestamp(tx.consensus_timestamp),
                    content: summarizeContent(accountId, tx.transfers ?? []),
                    status: tx.result ?? "UNKNOWN",
                }));

                setTransactions(rows);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen, accountId]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Transaction History"
            ariaHideApp={false}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Transaction History</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                    ✕
                </button>
            </div>

            {!accountId && (
                <p className="text-sm text-gray-400">
                    No wallet connected. Connect your wallet to view transaction history.
                </p>
            )}

            {accountId && loading && (
                <p className="text-sm text-gray-400">Loading transactions…</p>
            )}

            {accountId && error && (
                <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            {accountId && !loading && !error && transactions.length === 0 && (
                <p className="text-sm text-gray-400">No transactions found.</p>
            )}

            {accountId && !loading && !error && transactions.length > 0 && (
                <Table>
                    <TableCaption>Your last 5 transactions on Hedera testnet.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[160px]">Transaction ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Content</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-mono text-xs">
                                    {tx.id}
                                </TableCell>
                                <TableCell>{tx.type}</TableCell>
                                <TableCell className="text-xs text-gray-400">
                                    {tx.time}
                                </TableCell>
                                <TableCell className="text-right text-xs">
                                    {tx.content}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Modal>
    );
};

export default HistoryModal;