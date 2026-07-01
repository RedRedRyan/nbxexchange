import { magic } from "./auth.magic";

export async function copyAddress(address: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(address);
        return true;
    } catch {
        return false;
    }
}

export async function copyHederaAccountId(accountId: string): Promise<boolean> {
    return copyAddress(accountId);
}

// Placeholder for sending tokens — integrate Hedera SDK or Magic RPC later
export async function sendHbar(to: string, amount: number) {
    console.log(`Sending ${amount} HBAR to ${to}`);
}

export async function sendUsdc(to: string, amount: number) {
    console.log(`Sending ${amount} USDC to ${to}`);
}

export async function sendUsdt(to: string, amount: number) {
    console.log(`Sending ${amount} USDT to ${to}`);
}
