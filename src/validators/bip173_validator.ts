import { Currency, Options } from "../types/types";

const bech32 = require('../crypto/externals/bech32');
const DEFAULT_NETWORK_TYPE = 'prod'

// bip 173 bech 32 addresses (https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)
export function isValidAddress(address: string, currency: Currency, opts: Options | null): boolean {
    const networkType = opts ? opts.networkType : DEFAULT_NETWORK_TYPE;
    const decoded = bech32.decode(address, bech32.encodings.BECH32);
    if (!decoded) {
        return false;
    }

    const bech32Hrp = decoded.hrp;
    if (!currency.bech32Hrp) {
        return false;
    }
    let correctBech32Hrps: string[];
    if (networkType === 'prod' || networkType === 'testnet') {
        correctBech32Hrps = currency.bech32Hrp[networkType];
    } else {
        correctBech32Hrps = currency.bech32Hrp.prod.concat(currency.bech32Hrp.testnet)
    }

    if (correctBech32Hrps.indexOf(bech32Hrp) === -1) {
        return false;
    }

    return true;
}
