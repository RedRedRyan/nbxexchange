import { KESY_TOKEN } from "./constants";
import { associateToken } from "./wallet.actions";

export interface Token {
  automatic_association: boolean;
  balance: number;
  created_timestamp: string;
  decimals: number;
  token_id: string;
  freeze_status: "UNFROZEN" | "FROZEN" | "NOT_APPLICABLE";
  kyc_status: "GRANTED" | "REVOKED" | "NOT_APPLICABLE";
}

export interface AccountTokensResponse {
  tokens: Token[];
  links: {
    next: string | null;
  };
}

export const getBalance = async (
  tokenID: string,
  accountID: string
): Promise<number> => {
  const response = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountID}/tokens`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch account data");
  }

  const data: AccountTokensResponse = await response.json();

  // No tokens associated at all — empty array case
  if (!data.tokens || data.tokens.length === 0) {
    await associateToken(KESY_TOKEN.tokenId)
    return 0
  }

  const token = data.tokens.find((t) => t.token_id === tokenID);

  // Tokens exist, but not this specific one 
  await associateToken(KESY_TOKEN.tokenId)
  return token?.balance ?? 0;
};