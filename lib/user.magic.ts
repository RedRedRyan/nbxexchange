import { magic } from "./auth.magic";

export type WalletInfo = {
    hederaAccountId: string;
    evmAddress: string;
    hederaTestnetAddress: string;
};

export type UserInfo = {
    issuer: string;
    email: string | null;
    phoneNumber: string | null;
    isMfaEnabled: boolean;
    wallets: WalletInfo;
};

export async  function parseWallets(wallets: any): WalletInfo {
    const evmAddress = wallets?.ethereum?.publicAddress ?? "";
    const hederaSubAccounts = wallets?.hedera?.subAccounts ?? [];
    const testnetEntry = hederaSubAccounts.find((a: any) => a.name === "testnet");
    const hederaTestnetAddress = testnetEntry?.publicAddress ?? "";
    const hederaAccountId = wallets?.hedera?.publicAddress ?? hederaTestnetAddress;
    return { evmAddress, hederaTestnetAddress, hederaAccountId };
}

export async function getUserInfo(): Promise<UserInfo | null> {
    const raw = await magic!.user.getInfo();
    if (!raw) return null;
    const wallets = parseWallets(raw.wallets);
    return {
        issuer: raw.issuer ?? "",
        email: raw.email ?? null,
        phoneNumber: raw.phoneNumber ?? null,
        isMfaEnabled: raw.isMfaEnabled ?? false,
        wallets,
    };
}

export async function fetchHbarBalance(accountId: string): Promise<string> {
    if (!accountId) return "–";
    try {
        const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        if (!res.ok) return "–";
        const data = await res.json();
        const tinybars = data?.balance?.balance ?? 0;
        const hbar = (tinybars / 1e8).toFixed(4);
        return `${hbar} HBAR`;
    } catch {
        return "–";
    }
}
