var base32 = require('../crypto/externals/base32');
var bech32 = require('../crypto/externals/bech32');
import { Currency, Options } from '../types/types';
import * as BTCValidator from './bitcoin_validator';

function validateAddress(address: string, currency: Currency, opts: Options) {
    const networkType = opts ? opts.networkType : ''
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

    if (!regexp.test(raw_address)) {
        return false;
    }

    if (raw_address.toLowerCase() != raw_address && raw_address.toUpperCase() != raw_address) {
        return false;
    }

    const decoded = base32.b32decode(raw_address);
    if (networkType === 'testnet') {
        prefix = 'bchtest';
    }

    try {
        if (bech32.verifyChecksum(prefix, decoded, bech32.encodings.BECH32)) {
            return false;
        }
    } catch(e) {
        return false;
    }
    return true;
}

export function isValidAddress(address: string, currency: Currency, opts: Options) {
    return validateAddress(address, currency, opts) || BTCValidator.isValidAddress(address, currency, opts);
}
