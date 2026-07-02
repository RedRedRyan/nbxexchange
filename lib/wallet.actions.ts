import {
    AccountId,
    TokenId,
    TransferTransaction,
    TokenAssociateTransaction,
} from "@hashgraph/sdk";
import { MagicProvider } from "@/context/MagicProvider";
import { MagicWallet } from "@/context/MagicWallet";

// Magic singleton
import { magic } from "@/lib/auth.magic";

// Zustand store for user info
import { useUserStore } from "@/store/user.store";
import { getBalance } from "./balanceChecker";

export async function copyAddress(address: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(address);
        return true;
    } catch {
        return false;
    }
}

export async function copyHederaAccountId(accountId: string): Promise<boolean> {
    return copyAddress(accountId);
}

// Shared helper — both sendHbar and associateToken need the same signer setup
async function getMagicWallet(): Promise<MagicWallet> {
    if (!magic) throw new Error("Magic not initialized");

    const { userInfo } = useUserStore.getState();
    const publicAddress =
        userInfo?.wallets.hederaAccountId ||
        userInfo?.wallets.hederaTestnetAddress;

    if (!publicAddress) throw new Error("No authenticated Hedera account found");

    const { publicKeyDer } = await magic.hedera.getPublicKey();
    const magicSign = (message: Uint8Array) => magic!.hedera.sign(message);

    return new MagicWallet(
        publicAddress,
        new MagicProvider("testnet"),
        publicKeyDer,
        magicSign,
        magicSign //same signing function, passed for both params
    );
}
export async function sendHbar(recipientAddress: string, amount: string): Promise<string> {
    const magicWallet = await getMagicWallet();
    const publicAddress = magicWallet.getAccountId().toString();

    let transaction = await new TransferTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .addHbarTransfer(publicAddress, -1 * Number(amount))   // debit sender
        .addHbarTransfer(recipientAddress, Number(amount))     // credit recipient
        .freezeWithSigner(magicWallet);

    transaction = await transaction.signWithSigner(magicWallet);
    const result = await transaction.executeWithSigner(magicWallet);
    const receipt = await result.getReceiptWithSigner(magicWallet);

    return receipt.status.toString(); 
}

export const associateToken = async (tokenId: string): Promise<string> => {
   

    const magicWallet = await getMagicWallet();
    const accountId = magicWallet.getAccountId();
    let _acc = String(accountId)
    let isAssociated = await isTokenAssociated(_acc,tokenId)
    if(!isAssociated){
    let transaction = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([TokenId.fromString(tokenId)])
        .setNodeAccountIds([new AccountId(3)])
        .freezeWithSigner(magicWallet);

    // Sign with the Magic-backed signer for the authenticated account
    transaction = await transaction.signWithSigner(magicWallet);

    // Submit the transaction to the Hedera network
    const txResponse = await transaction.executeWithSigner(magicWallet);

    // Request the receipt of the transaction
    const receipt = await txResponse.getReceiptWithSigner(magicWallet);

    return receipt.status.toString();
    }
    else{
        return "Token is already associated"
    }
};

async function isTokenAssociated(accountId: string, tokenId: string): Promise<boolean> {
    if (!accountId || !tokenId) return false;
    try {
        const res = await fetch(
            `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`
        );
        if (!res.ok) return false;
        const data = await res.json();
        return Array.isArray(data?.tokens) && data.tokens.length > 0;
    } catch {
        return false;
    }
}
export async function sendToken(tokenID:string,toAccountID:string,amount:number) {
    const magicWallet = await getMagicWallet()
    let accountId1 = magicWallet.getAccountId();
    
    let _bal = await getBalance(tokenID,String(accountId1))
    let transaction = await new TransferTransaction()
     .addTokenTransfer(tokenID, accountId1, -amount)
     .addTokenTransfer(tokenID, toAccountID, amount)
     .freezeWithSigner(magicWallet);

 // Sign with the Magic-backed signer for the authenticated account
    transaction = await transaction.signWithSigner(magicWallet);

    // Submit the transaction to the Hedera network
    const txResponse = await transaction.executeWithSigner(magicWallet);

    // Request the receipt of the transaction
    const receipt = await txResponse.getReceiptWithSigner(magicWallet);

    return receipt.status.toString();

}