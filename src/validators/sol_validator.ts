import { PublicKey } from "@solana/web3.js";

export function isValidAddress(address: string): boolean {
    if (!address) return false;

    try {
        new PublicKey(address);
        return true;
    } catch (e) {
        return false;
    }
}
