import { create } from "zustand";
import { getUserInfo, fetchHbarBalance } from "@/lib/user.magic";
import { getBalance } from "@/lib/balanceChecker";
import { KESY_TOKEN } from "@/lib/constants";

type UserState = {
    userInfo: any | null;
    balance: string;
    usdcBalance: string;
    usdtBalance: string;
    kesyBalance: number;
    fetchUser: () => Promise<void>;
    fetchBalances: () => Promise<void>;
};

export const useUserStore = create<UserState>((set, get) => ({
    userInfo: null,
    balance: "",
    usdcBalance: "",
    usdtBalance: "",
    kesyBalance: 0,//Kenya Shilling Yield a Stable coin proposed by @NHX-finance (on X)

    fetchUser: async () => {
        const info = await getUserInfo();
        set({ userInfo: info });
    },

    fetchBalances: async () => {
        const accountId = get().userInfo?.wallets?.hederaAccountId;
        if (!accountId) return;

        const hbarBalance = await fetchHbarBalance(accountId);
        const kesyBalance = await getBalance(KESY_TOKEN.tokenId, accountId);

        set({
            balance: hbarBalance,
            kesyBalance,
            
        });
    },
}));