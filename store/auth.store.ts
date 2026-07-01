import { create } from "zustand";
import { connectWallet, disconnectWallet, fetchAuthenticatedUser } from "@/lib/auth.magic";
import { parseWallets } from "@/lib/user.magic";


type AuthState = {
    isConnected: boolean;
    address: string;
    isLoading: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    refreshSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    isConnected: false,
    address: "",
    isLoading: false,

    connect: async () => {
        set({ isLoading: true });
        try {
            const address = await connectWallet();
            set({ isConnected: true, address });
        } finally {
            set({ isLoading: false });
        }
    },

    disconnect: async () => {
        set({ isLoading: true });
        await disconnectWallet();
        set({ isConnected: false, address: "" });
        set({ isLoading: false });
    },

    refreshSession: async () => {
        set({ isLoading: true });
        const user = await fetchAuthenticatedUser();

        if (user) {
            const wallets = parseWallets(user.wallets);
            const address = wallets.evmAddress || wallets.hederaAccountId;
            set({ isConnected: true, address });
        } else {
            set({ isConnected: false, address: "" });
        }

        set({ isLoading: false });
    },
}));
