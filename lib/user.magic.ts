import { create } from "zustand";
import { Magic } from "magic-sdk";
import { HederaExtension } from "@magic-ext/hedera";

// Singleton Magic instance (client-side only)
export const magic =
    typeof window !== "undefined"
        ? new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
            extensions: [new HederaExtension({ network: "testnet" })],
        })
        : null
;

// ─── Types ────────────────────────────────────────────────────────────────────

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

type AuthState = {
    isConnected: boolean;
    address: string;
    isLoading: boolean;
    balance: string;
    userInfo: UserInfo | null;

    setIsConnected: (value: boolean) => void;
    setAddress: (address: string) => void;
    setLoading: (loading: boolean) => void;

    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    fetchAuthenticatedUser: () => Promise<void>;
    fetchBalance: () => Promise<void>;
    copyAddress: (which?: "evm" | "hedera") => Promise<boolean>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchHbarBalance(accountId: string): Promise<string> {
    if (!accountId) return "–";
    try {
        const res = await fetch(
            `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
        );
        if (!res.ok) return "–";
        const data = await res.json();
        const tinybars: number = data?.balance?.balance ?? 0;
        const hbar = (tinybars / 1e8).toFixed(4);
        return `${hbar} HBAR`;
    } catch {
        return "–";
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseWallets(wallets: any): WalletInfo {
    const evmAddress: string = wallets?.ethereum?.publicAddress ?? "";

    const hederaSubAccounts: { name: string; publicAddress: string }[] =
        wallets?.hedera?.subAccounts ?? [];
    const testnetEntry = hederaSubAccounts.find((a) => a.name === "testnet");
    const hederaTestnetAddress = testnetEntry?.publicAddress ?? "";

    const hederaAccountId: string =
        wallets?.hedera?.publicAddress ?? hederaTestnetAddress;

    return { evmAddress, hederaTestnetAddress, hederaAccountId };
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useMagicAuthStore = create<AuthState>((set, get) => ({
    isConnected: false,
    address: "",
    isLoading: true,
    balance: "–",
    userInfo: null,

    setIsConnected: (value) => set({ isConnected: value }),
    setAddress: (address) => set({ address }),
    setLoading: (loading) => set({ isLoading: loading }),

    connectWallet: async () => {
        set({ isLoading: true });
        try {
            const accounts = await magic!.wallet.connectWithUI();
            const evmAddress = Array.isArray(accounts) ? accounts[0] ?? "" : "";

            set({ isConnected: true, address: evmAddress });

            await get().fetchAuthenticatedUser();
        } catch (e) {
            console.error("connectWallet error", e);
            set({ isConnected: false, address: "", userInfo: null, balance: "–" });
        } finally {
            set({ isLoading: false });
        }
    },

    disconnectWallet: async () => {
        set({ isLoading: true });
        try {
            await magic!.user.logout();
            set({ isConnected: false, address: "", userInfo: null, balance: "–" });
        } catch (e) {
            console.error("disconnectWallet error", e);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });
        try {
            const isLoggedIn = await magic!.user.isLoggedIn();

            if (!isLoggedIn) {
                set({ isConnected: false, address: "", userInfo: null, balance: "–" });
                return;
            }

            const raw = await magic!.user.getInfo();
            const wallets = parseWallets(raw.wallets);

            const userInfo: UserInfo = {
                issuer: raw.issuer ?? "",
                email: raw.email ?? null,
                phoneNumber: raw.phoneNumber ?? null,
                isMfaEnabled: raw.isMfaEnabled ?? false,
                wallets,
            };

            const address = wallets.evmAddress || wallets.hederaAccountId;

            set({ isConnected: true, address, userInfo });

            await get().fetchBalance();
        } catch (e) {
            console.error("fetchAuthenticatedUser error", e);
            set({ isConnected: false, address: "", userInfo: null, balance: "–" });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchBalance: async () => {
        const { userInfo } = get();
        const accountId =
            userInfo?.wallets.hederaAccountId ||
            userInfo?.wallets.hederaTestnetAddress;

        if (!accountId) {
            set({ balance: "–" });
            return;
        }

        const balance = await fetchHbarBalance(accountId);
        set({ balance });
    },

    // ── Copy address ───────────────────────────────────────────────────────
    copyAddress: async (which = "evm") => {
        const { userInfo, address } = get();

        const target =
            which === "hedera"
                ? userInfo?.wallets.hederaAccountId ||
                userInfo?.wallets.hederaTestnetAddress
                : address || userInfo?.wallets.evmAddress;

        if (!target) {
            console.warn("copyAddress: no address available to copy");
            return false;
        }

        try {
            await navigator.clipboard.writeText(target);
            return true;
        } catch (e) {
            console.error("copyAddress error", e);
            return false;
        }
    },
}));

export default useMagicAuthStore;