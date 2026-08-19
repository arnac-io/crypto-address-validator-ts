import { Currency, Options } from '../types/types';
import * as BIP173Validator from './bip173_validator';


export function isValidAddress(address: string, currency: Currency, opts: Options | null) {
    return BIP173Validator.isValidAddress(address, currency, opts);
}
