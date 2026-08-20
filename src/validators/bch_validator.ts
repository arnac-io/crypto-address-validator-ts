import { Currency, Options } from '../types/types';
import * as BTCValidator from './bitcoin_validator';

// cashaddr charset — the same 5-bit alphabet bech32 uses, but the checksum below is not
// bech32's: cashaddr defines its own 40-bit BCH code.
// https://reference.cash/protocol/blockchain/encoding/cashaddr
const CASHADDR_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function cashaddrPolymod(values: number[]) {
    let c = 1n;

    for (const d of values) {
        const c0 = c >> 35n;
        c = ((c & 0x07ffffffffn) << 5n) ^ BigInt(d);

        if (c0 & 0x01n) c ^= 0x98f2bc8e61n;
        if (c0 & 0x02n) c ^= 0x79b76d99e2n;
        if (c0 & 0x04n) c ^= 0xf33e5fb3c4n;
        if (c0 & 0x08n) c ^= 0xae2eabe2a8n;
        if (c0 & 0x10n) c ^= 0x1e4f43e470n;
    }

    return c ^ 1n;
}

function verifyChecksum(prefix: string, payload: string) {
    const values: number[] = [];

    // the prefix contributes the low 5 bits of each character, then a separator
    for (let i = 0; i < prefix.length; i++) {
        values.push(prefix.charCodeAt(i) & 0x1f);
    }
    values.push(0);

    for (const char of payload) {
        const value = CASHADDR_CHARSET.indexOf(char);
        if (value === -1) {
            return false;
        }
        values.push(value);
    }

    return cashaddrPolymod(values) === 0n;
}

function validateAddress(address: string, currency: Currency, opts: Options | null) {
    const networkType = opts?.networkType ?? ''
    const regexp = currency.regexp;
    let prefix = 'bitcoincash';
    let raw_address;

    const res = address.split(':');
    if (res.length === 1) {
        raw_address = address
    } else {
        if (res[0] !== 'bitcoincash') {
            return false;
        }
        raw_address = res[1];
    }

    if (!regexp || !regexp.test(raw_address)) {
        return false;
    }

    if (raw_address.toLowerCase() != raw_address && raw_address.toUpperCase() != raw_address) {
        return false;
    }

    if (networkType === 'testnet') {
        prefix = 'bchtest';
    }

    // cashaddr is defined over the lowercase form; an all-uppercase address is equivalent
    return verifyChecksum(prefix, raw_address.toLowerCase());
}

export function isValidAddress(address: string, currency: Currency, opts: Options | null) {
    return validateAddress(address, currency, opts) || BTCValidator.isValidAddress(address, currency, opts);
}
