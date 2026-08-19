import { Currency, Options } from "../types/types";

var segwit = require('../crypto/externals/segwit_addr');

export function isValidAddress(address: string, currency: Currency, opts: Options | null): boolean {
    return segwit.isValidAddress(address, currency, opts);
}
