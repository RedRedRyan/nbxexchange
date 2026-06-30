import { create } from "zustand";
import { Magic } from "magic-sdk";
import { HederaExtension } from "@magic-ext/hedera";

// Singleton Magic instance (client-side only)
export const magic =
    typeof window !== "undefined"
        ? new Magic("pk_live_0018166BD8A4181E", {
            extensions: [new HederaExtension({ network: "testnet" })],
        })
        : null;

type AuthState = {
    isConnected: boolean;
    address: string;
    isLoading: boolean;

    setIsConnected: (value: boolean) => void;
    setAddress: (address: string) => void;
    setLoading: (loading: boolean) => void;

    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    fetchAuthenticatedUser: () => Promise<void>;
};

const useMagicAuthStore = create<AuthState>((set) => ({
    isConnected: false,
    address: "",
    isLoading: true,

    setIsConnected: (value) => set({ isConnected: value }),
    setAddress: (address) => set({ address }),
    setLoading: (loading) => set({ isLoading: loading }),

    connectWallet: async () => {
        set({ isLoading: true });
        try {
            const result = await magic!.wallet.connectWithUI();
            // result contains publicAddress and email
            const address = result?.publicAddress ?? "";
            set({ isConnected: true, address });
        } catch (e) {
            console.error("connectWallet error", e);
            set({ isConnected: false, address: "" });
        } finally {
            set({ isLoading: false });
        }
    },

    disconnectWallet: async () => {
        set({ isLoading: true });
        try {
            await magic!.user.logout();
            set({ isConnected: false, address: "" });
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
            if (isLoggedIn) {
                const { publicAddress } = await magic!.user.getInfo();
                set({ isConnected: true, address: publicAddress ?? "" });
            } else {
                set({ isConnected: false, address: "" });
            }
        } catch (e) {
            console.error("fetchAuthenticatedUser error", e);
            set({ isConnected: false, address: "" });
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useMagicAuthStore;
