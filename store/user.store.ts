import { create } from "zustand";
import { getUserInfo, fetchHbarBalance } from "@/lib/user.magic";

type UserState = {
    userInfo: any | null;
    balance: string;
    usdcBalance: string;
    usdtBalance: string;
    fetchUser: () => Promise<void>;
    fetchBalances: () => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
    userInfo: null,
    balance: "–",
    usdcBalance: "–",
    usdtBalance: "–",

    fetchUser: async () => {
        const info = await getUserInfo();
        set({ userInfo: info });
    },

    fetchBalances: async () => {
        const accountId = get().userInfo?.wallets.hederaAccountId;
        const balance = await fetchHbarBalance(accountId);
        // Placeholder for USDC/USDT — integrate Hedera Token Service or Mirror Node token balances later
        set({ balance, usdcBalance: "0 USDC", usdtBalance: "0 USDT" });
    },
}));
