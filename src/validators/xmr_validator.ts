import { keccak256Checksum } from '../crypto/utils';
import { Currency, Options } from '../types/types';
var cnBase58 = require('../crypto/externals/cnBase58');

var DEFAULT_NETWORK_TYPE = 'prod'
var addressRegTest = new RegExp(
  '^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{95}$'
)
var integratedAddressRegTest = new RegExp(
  '^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{106}$'
)

function validateNetwork(decoded: string, currency: Currency, networkType: string, addressType: string) {
  var network = addressType == 'integrated' ? currency.iAddressTypes : currency.addressTypes
  if (!network) {
    return false
  }
  var at = parseInt(decoded.substr(0, 2), 16).toString()

  switch (networkType) {
    case 'prod':
      return network.prod.indexOf(at) >= 0
    case 'testnet':
      return network.testnet.indexOf(at) >= 0
    case 'stagenet':
      return network.stagenet?.includes(at) ?? false
    case 'both':
      return network.prod.indexOf(at) >= 0 || network.testnet.indexOf(at) >= 0 ||
        (network.stagenet?.includes(at) ?? false)
    default:
      return false
  }
}

function hextobin(hex: string) {
  if (hex.length % 2 !== 0) return null
  var res = new Uint8Array(hex.length / 2)
  for (var i = 0; i < hex.length / 2; ++i) {
    res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return res
}

export function isValidAddress(address: string, currency: Currency, opts: Options | null): boolean {
    var networkType = opts?.networkType ?? DEFAULT_NETWORK_TYPE
    var addressType = 'standard'
    if (!addressRegTest.test(address)) {
      if (integratedAddressRegTest.test(address)) {
        addressType = 'integrated'
      } else {
        return false
      }
    }

    var decodedAddrStr = cnBase58.decode(address)
    if (!decodedAddrStr) return false

    if (!validateNetwork(decodedAddrStr, currency, networkType, addressType)) return false

    var addrChecksum = decodedAddrStr.slice(-8)
    var payload = hextobin(decodedAddrStr.slice(0, -8))
    if (!payload) return false
    var hashChecksum = keccak256Checksum(payload)

    return addrChecksum === hashChecksum
}
