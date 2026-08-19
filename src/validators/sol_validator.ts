const base58 = require('../crypto/externals/base58');

// A Solana address is a 32-byte Ed25519 public key in base58 — the same check
// @solana/web3.js's `new PublicKey(string)` performs: base58-decode, then require 32 bytes.
const PUBLIC_KEY_LENGTH = 32;

export function isValidAddress(address: string): boolean {
    if (!address) return false;

    try {
        return base58.decode(address).length === PUBLIC_KEY_LENGTH;
    } catch (e) {
        return false;
    }
}
