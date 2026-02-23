import * as ETHValidator from './ethereum_validator';
import * as BIP173Validator from './bip173_validator';
import { Currency, Options } from '../types/types';

export function isValidAddress(address: string, currency: Currency, opts: Options): boolean {
    // Native Injective bech32 addresses (inj1...)
    if (address.startsWith('inj1')) {
        return BIP173Validator.isValidAddress(address, currency, opts);
    }
    // EVM addresses (0x...)
    return ETHValidator.isValidAddress(address);
}
