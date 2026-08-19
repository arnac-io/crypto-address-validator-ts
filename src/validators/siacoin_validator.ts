import {blake2b} from '../crypto/utils';
var isEqual = require('lodash.isequal');

export function isValidAddress(address: string) {
  if (address.length !== 76) {
    // Check if it has the basic requirements of an address
    return false
  }

  // Otherwise check each case
  return verifyChecksum(address)
}

function verifyChecksum(address: string) {
  const checksumBytes = address.slice(0, 32*2)
  const check = address.slice(32*2, 38*2)
  const blakeHash = blake2b(checksumBytes, 32).slice(0, 6*2)
  return !!isEqual(blakeHash, check)
}
