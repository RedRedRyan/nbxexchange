import { AccountId, TransferTransaction } from "@hashgraph/sdk";
import { MagicProvider } from "@/context/MagicProvider";
import { MagicWallet } from "@/context/MagicWallet";

// Magic singleton
import { magic } from "@/lib/auth.magic";

// Zustand store for user info
import { useUserStore } from "@/store/user.store";


export async function sendHbar(recipientAddress: string, amount: string): Promise<string> {
    if (!magic) throw new Error("Magic not initialized");

    // Pull the sender's Hedera account ID from the Zustand store
    const { userInfo } = useUserStore.getState();
    const publicAddress =
        userInfo?.wallets.hederaAccountId ||
        userInfo?.wallets.hederaTestnetAddress;

    if (!publicAddress) throw new Error("No authenticated Hedera account found");

    // Get the Hedera public key and sign function from the Magic extension
    const { publicKeyDer } = await magic.hedera.getPublicKey();
    const magicSign = (message: Uint8Array) => magic!.hedera.sign(message);

    // Build the MagicWallet signer
    const magicWallet = new MagicWallet(
        publicAddress,
        new MagicProvider("testnet"),
        publicKeyDer,
        magicSign
    );

    // Build, sign, and execute the HBAR transfer
    let transaction = await new TransferTransaction()
        .setNodeAccountIds([new AccountId(3)])
        .addHbarTransfer(publicAddress, -1 * Number(amount))   // debit sender
        .addHbarTransfer(recipientAddress, Number(amount))     // credit recipient
        .freezeWithSigner(magicWallet);

    transaction = await transaction.signWithSigner(magicWallet);
    const result = await transaction.executeWithSigner(magicWallet);
    const receipt = await result.getReceiptWithSigner(magicWallet);

    return receipt.status.toString(); // e.g. "SUCCESS"
}


