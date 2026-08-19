const base58 = require('../crypto/externals/base58');

// A Solana address is a 32-byte Ed25519 public key in base58 — the same check
// @solana/web3.js's `new PublicKey(string)` performs: base58-decode, then require 32 bytes.
const PUBLIC_KEY_LENGTH = 32;

// 32 bytes is 43-44 base58 characters, or as few as 32 when the key is leading zeros
const MIN_LENGTH = 32;
const MAX_LENGTH = 44;

export function isValidAddress(address: string): boolean {
    if (!address || address.length < MIN_LENGTH || address.length > MAX_LENGTH) return false;

    try {
        return base58.decode(address).length === PUBLIC_KEY_LENGTH;
    } catch (e) {
        return false;
    }
}
