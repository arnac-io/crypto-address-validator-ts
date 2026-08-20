import { getAll, getByNameOrSymbol } from './currencies';
import type { Options } from './types/types';

export type { AddressType, Currency, Options } from './types/types';

export function validate(address: string, currencyNameOrSymbol: string, opts: Options | null = null) {
    var currency = getByNameOrSymbol(currencyNameOrSymbol);

    if (!currency || !currency.validator) {
        throw new Error('Missing validator for currency: ' + currencyNameOrSymbol);
    }

    // the validators assume a string; a nullish address would throw out of a decoder instead
    if (typeof address !== 'string' || address.length === 0) {
        return false;
    }

    return currency.validator(address, currency, opts);
}
    
export function getCurrencies() {
    return getAll();
}

export function findCurrency(symbol: string) {
    return getByNameOrSymbol(symbol) || null ;
}

