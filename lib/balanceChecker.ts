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
): Promise<number | undefined> => {
  const response = await fetch(
    `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${accountID}/tokens`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch account data");
  }

  const data: AccountTokensResponse = await response.json();

  const token = data.tokens.find(
    (t) => t.token_id === tokenID
  );

  return token?.balance;
};