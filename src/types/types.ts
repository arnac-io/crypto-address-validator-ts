export interface Currency {
    name: string;
    symbol: string;
    validator: (address: string, currency: Currency, opts: Options | null) => boolean;
    addressTypes?: AddressType;
    iAddressTypes?: AddressType;
    expectedLength?: number;
    hashFunction?: string;
    regexp?: RegExp;
    bech32Hrp?: AddressType;
}

export interface Options {
    /**
     * Passed through to the validator untouched; only the USDT validator reads it, to pick
     * between the ERC-20 and Omni address forms. Left as `string` because callers use it to
     * carry their own chain identifiers.
     */
    chainType?: string;
    /** Defaults to `'prod'`. `'both'` enforces neither network. `'stagenet'` is Monero-only. */
    networkType?: 'prod' | 'testnet' | 'both' | 'stagenet';
}

export interface AddressType {
    prod: string[];
    testnet: string[];
    stagenet?: string[];
}
