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
    /** Native Hedera account ID (0.0.XXXXX) from the Hedera extension */
    hederaAccountId: string;
    /** EVM-compatible public address (0x…) – from the ethereum wallet entry */
    evmAddress: string;
    /** Hedera testnet address from wallets.hedera.subAccounts */
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
    /** Primary display address – EVM address returned by connectWithUI / getInfo */
    address: string;
    isLoading: boolean;
    /** HBAR balance as a human-readable string, e.g. "12.5 HBAR" */
    balance: string;
    userInfo: UserInfo | null;

    setIsConnected: (value: boolean) => void;
    setAddress: (address: string) => void;
    setLoading: (loading: boolean) => void;

    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    fetchAuthenticatedUser: () => Promise<void>;
    fetchBalance: () => Promise<void>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fetch HBAR balance for a Hedera testnet account via Mirror Node REST API.
 * Returns a formatted string like "12.5 HBAR" or "–" on failure.
 */
async function fetchHbarBalance(accountId: string): Promise<string> {
    if (!accountId) return "–";
    try {
        const res = await fetch(
            `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
        );
        if (!res.ok) return "–";
        const data = await res.json();
        // balance.balance is in tinybars (1 HBAR = 100,000,000 tinybars)
        const tinybars: number = data?.balance?.balance ?? 0;
        const hbar = (tinybars / 1e8).toFixed(4);
        return `${hbar} HBAR`;
    } catch {
        return "–";
    }
}

/**
 * Parse the SDK v30+ wallets object into our WalletInfo shape.
 * Falls back gracefully when fields are missing (older SDK / network quirks).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseWallets(wallets: any): WalletInfo {
    const evmAddress: string =
        wallets?.ethereum?.publicAddress ?? "";

    // Hedera testnet address lives in subAccounts
    const hederaSubAccounts: { name: string; publicAddress: string }[] =
        wallets?.hedera?.subAccounts ?? [];
    const testnetEntry = hederaSubAccounts.find((a) => a.name === "testnet");
    const hederaTestnetAddress = testnetEntry?.publicAddress ?? "";

    // Native Hedera account ID – mainnet slot (may be null on testnet-only)
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

    // ── Connect ────────────────────────────────────────────────────────────
    connectWallet: async () => {
        set({ isLoading: true });
        try {
            // SDK v30+: connectWithUI returns String[] — first element is the EVM address
            const accounts = await magic!.wallet.connectWithUI();
            const evmAddress = Array.isArray(accounts) ? accounts[0] ?? "" : "";

            set({ isConnected: true, address: evmAddress });

            // Hydrate full user info + balance after connecting
            await get().fetchAuthenticatedUser();
        } catch (e) {
            console.error("connectWallet error", e);
            set({ isConnected: false, address: "", userInfo: null, balance: "–" });
        } finally {
            set({ isLoading: false });
        }
    },

    // ── Disconnect ─────────────────────────────────────────────────────────
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

    // ── Fetch authenticated user (session restore on mount) ────────────────
    fetchAuthenticatedUser: async () => {
        set({ isLoading: true });
        try {
            const isLoggedIn = await magic!.user.isLoggedIn();

            if (!isLoggedIn) {
                set({ isConnected: false, address: "", userInfo: null, balance: "–" });
                return;
            }

            // SDK v30+: publicAddress is gone from the top level — use wallets object
            const raw = await magic!.user.getInfo();

            const wallets = parseWallets(raw.wallets);

            const userInfo: UserInfo = {
                issuer: raw.issuer ?? "",
                email: raw.email ?? null,
                phoneNumber: raw.phoneNumber ?? null,
                isMfaEnabled: raw.isMfaEnabled ?? false,
                wallets,
            };

            // Prefer EVM address as the primary display address
            const address = wallets.evmAddress || wallets.hederaAccountId;

            set({ isConnected: true, address, userInfo });

            // Fetch HBAR balance in the background
            await get().fetchBalance();
        } catch (e) {
            console.error("fetchAuthenticatedUser error", e);
            set({ isConnected: false, address: "", userInfo: null, balance: "–" });
        } finally {
            set({ isLoading: false });
        }
    },

    // ── Fetch balance ──────────────────────────────────────────────────────
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
}));

export default useMagicAuthStore;