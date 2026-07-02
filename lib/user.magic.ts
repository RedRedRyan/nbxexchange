import { magic } from "./auth.magic";

export type WalletInfo = {
    hederaAccountId: string;
    evmAddress: string;
    hederaTestnetAddress: string;
};
export interface Token {
  automatic_association: boolean;
  balance: number;
  created_timestamp: string;
  decimals: number;
  token_id: string;
  freeze_status: "UNFROZEN" | "FROZEN" | "NOT_APPLICABLE";
  kyc_status: "GRANTED" | "REVOKED" | "NOT_APPLICABLE";
}
export type UserInfo = {
    issuer: string;
    email: string | null;
    phoneNumber: string | null;
    isMfaEnabled: boolean;
    wallets: WalletInfo;
};
interface AccountTokenBalance {
  token_id: string;
  balance: string;
  decimals: number;
}

interface TokenMetadata {
  token_id: string;
  name: string;
  symbol: string;
  decimals: number;
}
export   function parseWallets(wallets: any): WalletInfo {
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
    if (!accountId) return "";
    try {
        const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`);
        if (!res.ok) return "–";
        const data = await res.json();
        const tinybars = data?.balance?.balance ?? 0;
        const hbar = (tinybars / 1e8).toFixed(4);
        return `${hbar} HBAR`;
    } catch {
        return "";
    }
}


// Fetch tokens held by an account
export async function getUserTokens(accountID: string): Promise<AccountTokenBalance[]> {
  const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountID}`);
  if (!res.ok) {
    throw new Error(`Mirror Node error: ${res.status}`);
  }
  const data = await res.json();
  return data.tokens as AccountTokenBalance[];
}

// Fetch metadata for a single token
async function getTokenMetadata(tokenId: string): Promise<TokenMetadata> {
  const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}`);
  if (!res.ok) {
    throw new Error(`Mirror Node error fetching token ${tokenId}: ${res.status}`);
  }
  const data = await res.json();
  return {
    token_id: tokenId,
    name: data.name,
    symbol: data.symbol,
    decimals: data.decimals,
    
  };
}

// Combine balances with metadata
export async function getUserTokensWithMetadata(accountID: string): Promise<TokenMetadata[]> {
  const tokens = await getUserTokens(accountID);

  // Resolve metadata for each token in parallel
  const metadataList = await Promise.all(
    tokens.map(async (t) => {
      const meta = await getTokenMetadata(t.token_id);
      return {
        ...meta,
        balance: t.balance,
      };
    })
  );

  return metadataList;
  /*
      Output example:
      [
        { token_id: "0.0.123456", name: "USD Coin", symbol: "USDC", decimals: 6, balance: "1000" },
        { token_id: "0.0.789012", name: "MyNFT", symbol: "MNFT", decimals: 0, balance: "1" }
      ]
    */
}

