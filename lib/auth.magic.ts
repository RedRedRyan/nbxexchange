import { Magic } from "magic-sdk";
import { HederaExtension } from "@magic-ext/hedera";

export const magic =
    typeof window !== "undefined"
        ? new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
            extensions: [new HederaExtension({ network: "testnet" })],
        })
        : null;

export async function connectWallet() {
    const accounts = await magic!.wallet.connectWithUI();
    const evmAddress = Array.isArray(accounts) ? accounts[0] ?? "" : "";
    return evmAddress;
}

export async function disconnectWallet() {
    await magic!.user.logout();
}

export async function fetchAuthenticatedUser() {
    const isLoggedIn = await magic!.user.isLoggedIn();
    if (!isLoggedIn) return null;
    const info = await magic!.user.getInfo();
    return info;
}
