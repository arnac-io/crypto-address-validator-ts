var base58 = require('../crypto/externals/base58');
import * as BIP173Validator from './bip173_validator';
import { Currency, Options } from '../types/types';
import * as CRC from 'crc';
const cbor = require('cbor-js');

function getDecoded(address: string) {
    try {
        const decoded = base58.decode(address);
        return cbor.decode(new Uint8Array(decoded).buffer);
    } catch (e) {
        // if decoding fails, assume invalid address
        return null;
    }
}

function isValidAddressV1(address: string) {
    const decoded = getDecoded(address);

    if (!decoded || (!Array.isArray(decoded) && decoded.length != 2)) {
        return false;
    }

    const tagged = decoded[0];
    const validCrc = decoded[1];
    if (typeof (validCrc) != 'number') {
        return false;
    }

    // get crc of the payload
    const crc = CRC.crc32(tagged);

    return crc == validCrc;
}

function isValidAddressShelley(address: string, currency: Currency, opts: Options | null) {
    // shelley address are just bip 173 - bech32 addresses (https://cips.cardano.org/cips/cip4/)
    return BIP173Validator.isValidAddress(address, currency, opts);
}

export function isValidAddress(address: string, currency: Currency, opts: Options | null = null) {
    return isValidAddressV1(address) || isValidAddressShelley(address, currency, opts);
}
