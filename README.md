# @fordefi/crypto-address-validator-ts

Crypto address validator for Bitcoin and other altcoins, in **TypeScript**. This is Fordefi's fork,
maintained for use in Fordefi products.

Published as **`@fordefi/crypto-address-validator-ts`**. Two related names exist and are *not* this
package:

* `@fordefi-public/crypto-address-validator-ts` — the previous name of this fork, deprecated as of
  0.6.0.
* `crypto-address-validator-ts` (unscoped) — the upstream project this was forked from. It is a
  different, older package.

### Fork lineage

[defunctzombie/bitcoin-address](https://github.com/defunctzombie/bitcoin-address) (Roman Shtylman)
→ [ryanralph/altcoin-address](https://github.com/ryanralph/altcoin-address)
→ [christsim/multicoin-address-validator](https://github.com/christsim/multicoin-address-validator)
→ [marksuurland/crypto-address-validator-ts](https://github.com/marksuurland/crypto-address-validator-ts)
→ [arnac-io/crypto-address-validator-ts](https://github.com/arnac-io/crypto-address-validator-ts)

MIT licensed throughout; the copyright notice originates with Roman Shtylman. See
[Differences from upstream](#differences-from-upstream) for what this fork changed, and
[CHANGELOG.md](CHANGELOG.md) for the release history.

## Installation

```
npm install @fordefi/crypto-address-validator-ts
```

Requires **Node.js >= 20.19**. The package ships CommonJS and works in Node and in bundlers
(webpack, Vite, esbuild, Rollup).

## API

Named imports are the API — there is no default export.

```typescript
import { validate, getCurrencies, findCurrency } from '@fordefi/crypto-address-validator-ts';
import type { AddressType, Currency, Options } from '@fordefi/crypto-address-validator-ts';
```

##### `validate(address, currencyNameOrSymbol, opts?)`

* `address` — wallet address to validate.
* `currencyNameOrSymbol` — currency name or symbol, e.g. `'bitcoin'`, `'litecoin'` or `'LTC'`
  (case-insensitive). See [supported currencies](#supported-crypto-currencies).
* `opts` — optional; `Options | null`. Omit it (or pass `null`) for default behaviour.

> Returns `true` if the address is a valid wallet address for that currency. **Throws**
> `Missing validator for currency: <symbol>` if the currency is unknown.

```typescript
interface Options {
    networkType?: 'prod' | 'testnet' | 'both' | 'stagenet';
    chainType?: string;
}
```

Both fields are optional and `opts` itself may be omitted or `null`. An absent `networkType`
behaves as `'prod'`; `'both'` enforces neither network; `'stagenet'` is Monero-only. `chainType`
is only read by the USDT validator, to choose between its ERC-20 and Omni forms — every other
currency ignores it, and it is typed `string` so callers can pass their own chain identifiers.

`validate()` returns `false` for an empty or nullish `address`. It throws only for an unknown
currency; use `findCurrency()` to test support without throwing.

##### `getCurrencies()`

> Returns `Currency[]` — every supported currency.

##### `findCurrency(symbol)`

> Returns the matching `Currency`, or `null` if the symbol is not supported. Unlike `validate()`,
> this does not throw.

### Supported crypto currencies

* 0x/zrx `'0x'` or `'zrx'`
* 1inch Network/1inch `'1inch Network'` or `'1inch'` only erc-20 validation no bep-20, xdai or avalanche c-chain
* Aave Coin/aave `'Aave Coin'` or `'aave'`
* Aavegotchi/ghst `'Aavegotchi'` or `'ghst'`
* Amp/amp `'Amp'` or `'amp'`
* Aragon/ant `'Aragon'` or `'ant'`
* Alpha Finance Lab/alpha `'Alpha Finance Lab'` or `'alpha'` only erc-20 validation no bep-20
* Audius/audio `'Audius'` or `'audio'`
* Augur/rep `'Augur'` or `'rep'`
* AugurV2/repv2 `'AugurV2'` or `'repv2'`
* AuroraCoin/aur `'AuroraCoin'` or `'aur'`
* Axie Infinity/axs `'Axie Infinity'` or `'axs'`
* Badger DAO/badger `'Badger DAO'` or `'badger'`
* Balancer/bal `'Balancer'` or `'bal'`
* Bancor/bnt `'Bancor'` or `'bnt'`
* Band Protocol/band `'Band Protocol'` or `'band'` only erc-20 validation no bep-20, xdai or fantom
* Bankex/bkx `'Bankex'` or `'bkx'`
* Basic Attention Token/bat `'Basic Attention Token'` or `'bat'`
* BeaverCoin/bvc `'BeaverCoin'` or `'bvc'`
* Binance Coin Mainnet/bnb `'Binance Coin Mainnet'` or `'bnb'`
* BioCoin/bio `'BioCoin'` or `'bio'`
* Bitcoin/btc `'Bitcoin'` or `'btc'`
* Bitcoin SV/bsv `'Bitcoin SV'` or `'bsv'`
* BitcoinCash/bch `'BitcoinCash'` or `'bch'`
* BitcoinGold/btg `'BitcoinGold'` or `'btg'`
* BitcoinPrivate/btcp `'BitcoinPrivate'` or `'btcp'`
* BitcoinZ/btcz `'BitcoinZ'` or `'btcz'`
* BlockTrade/btt `'BlockTrade'` or `'btt'`
* Bluzelle/blz `'Bluzelle'` or `'blz'`
* BTU Protocol/btu `'BTU Protocol'` or `'btu'`
* bZx Protocol/bzrx `'bZx Protocol'` or `'bzrx'`
* Callisto/clo `'Callisto'` or `'clo'`
* Cardano/ada `'Cardano'` or `'ada'`
* Cartesi/ctsi `'Cartesi'` or `'ctsi'` only erc-20 validation no bep-20, polygon or avalanche c-chain
* Celsius/cel `'Celsius'` or `'cel'`
* Chiliz/chz `'Chiliz'` or `'chz'` only erc-20 validation no bep-20
* Chainlink/link `'Chainlink'` or `'link'`
* Civic/cvc `'Civic'` or `'cvc'`
* Compound/comp `'Compound'` or `'comp'`
* Cream Finance/cream `'Cream Finance'` or `'cream'` only erc-20 validation no bep-20, xdai or fantom
* Cred/lba `'Cred'` or `'lba'`
* Crypto.com Coin/cro `'Crypto.com Coin'` or `'cro'`
* Curve DAO Token/crv `'Curve DAO Token'` or `'crv'`
* CUSD/cusd `'CUSD'` or `'cusd'`
* Dash/dash `'Dash'` or `'dash'`
* Decentraland/mana `'Decentraland'` or `'mana'`
* Decred/dcr `'Decred'` or `'dcr'`
* Dent/dent `'Dent'` or `'dent'`
* DigiByte/dgb `'DigiByte'` or `'dgb'`
* District0x/dnt `'District0x'` or `'dnt'`
* DogeCoin/doge `'DogeCoin'` or `'doge'`,
* dYdX/dydx `'dYdX'` or `'dydx'`
* EasyFi/ez `'EasyFi'` or `'ez'`
* Efinity Token/efi `'Efinity Token'` or `'efi'`
* Enjin Coin/enj `'Enjin Coin'` or `'enj'`
* Enzyme/mln `'Enzyme'` or `'mln'`
* EOS/eos `'EOS'` or `'eos'`
* Ethereum/eth `'Ethereum'` or `'eth'`
* EthereumClassic/etc `'EthereumClassic'` or `'etc'`
* Ethereum Name Service/ens `'Ethereum Name Service'` or `'ens'`
* Ethernity Chain/ern `'Ethernity Chain'` or `'ern'`
* EtherZero/etz `'EtherZero'` or `'etz'`
* Expanse/exp `'Expanse'` or `'exp'`
* e-Radix/exrd `'e-Radix'` or `'exrd'`
* Fantom/ftm `'Fantom'` or `'ftm'`
* FirmaChain/fct `'FirmaChain'` or `'fct'`
* FreiCoin/frc `'FreiCoin'` or `'frc'`
* FTX Token/ftt `'FTX Token'` or `'ftt'`
* FUNToken/fun `'FUNToken'` or `'fun'`
* GameCredits/game `'GameCredits'` or `'game'`
* GarliCoin/grlc `'GarliCoin'` or `'grlc'`
* Gnosis/gno `'Gnosis'` or `'gno'`
* Gods Unchained/gods `'Gods Unchained'` or `'gods'`
* Golem/glm `'Golem'` or `'glm'`
* Golem (GNT)/gnt `'Golem (GNT)'` or `'gnt'`
* HedgeTrade/hedg `'HedgeTrade'` or `'hedg'`
* Hegic/hegic `'Hegic'` or `'hegic'`
* Holo/hot `'Holo'` or `'hot'` only erc-20 validation no xdai
* Hush/hush `'Hush'` or `'hush'`
* HyperSpace/xsc `'HyperSpace'` or `'xsc'`
* ICON/icx `'ICON'` or `'icx'`
* iExec RLC/rlc `'iExec RLC'` or `'rlc'`
* Immutable X/imx `'Immutable X'` or `'imx'`
* Illuvium/ilv `'Illuvium'` or `'ilv'`
* Injective Protocol/inj `'Injective Protocol'` or `'inj'`
* IOTA/miota `'IOTA'` or `'miota'`
* Komodo/kmd `'Komodo'` or `'kmd'`
* KeeperDAO/rook `'KeeperDAO'` or `'rook'`
* Kyber Network Crystal v2/knc `'Kyber Network Crystal v2'` or `'knc'`
* LBRY Credits/lbc `'LBRY Credits'` or `'lbc'`
* UNUS SED LEO/leo `'UNUS SED LEO'` or `'leo'`
* Lisk/lsk `'Lisk'` or `'lsk'`
* LiteCoin/ltc `'LiteCoin'` or `'ltc'`
* Loopring/lrc `'Loopring'` or `'lrc'`
* Loom Network/loom `'Loom Network'` or `'loom'`
* Maker/mkr `'Maker'` or `'mkr'`
* Marlin/pond `'Marlin'` or `'pond'`
* Matchpool/gup `'Matchpool'` or `'gup'`
* Matic/matic `'Matic'` or `'matic'`
* MegaCoin/mec `'MegaCoin'` or `'mec'`
* Melon/mln `'Melon'` or `'mln'`
* Metal/mtl `'Metal'` or `'mtl'`
* Mirror Protocol/mir `'Mirror Protocol'` or `'mir'` only erc-20 validation no bep-20 or terra
* MonaCoin/mona `'MonaCoin'` or `'mona'`
* Monero/xmr `'Monero'` or `'xmr'`
* Multi-collateral DAI/dai `'Multi-collateral DAI'` or `'dai'`
* MyNeighborAlice/alice `'MyNeighborAlice'` or `'alice'` only erc-20 validation no bep-20
* NameCoin/nmc `'NameCoin'` or `'nmc'`
* Nem/xem `'Nem'` or `'xem'`
* Neo/neo `'Neo'` or `'neo'`
* NeoGas/gas `'NeoGas'` or `'gas'`
* Numeraire/nmr `'Numeraire'` or `'nmr'`
* Ocean Protocol/ocean `'Ocean Protocol'` or `'ocean'`
* Odyssey/ocn `'Odyssey'` or `'ocn'`
* OKB/okb `'OKB'` or `'okb'`
* OmiseGO/omg `'OmiseGO'` or `'omg'`
* Orchid/oxt `'Orchid'` or `'oxt'`
* Origin Protocol/ogn `'Origin Protocol'` or `'ogn'`
* Orion Protocol/orn `'Orion Protocol'` or `'orn'`
* Paxos/pax `'Paxos'` or `'pax'`
* Pearl/pearl `'Pearl'` or `'pearl'`
* PeerCoin/ppc `'PeerCoin'` or `'ppc'`
* Perpetual Protocol/perp `'Perpetual Protocol'` or `'perp'`
* Phala Network/pha `'Phala Network'` or `'pha'`
* PIVX/pivx `'PIVX'` or `'pivx'`
* Polkadot/dot `'Polkadot'` or `'dot'`
* Polymath/poly `'Polymath'` or `'poly'`
* PrimeCoin/xpm `'PrimeCoin'` or `'xpm'`
* ProtoShares/pts `'ProtoShares'` or `'pts'`
* Pundi X/pundix `'Pundi X'` or `'pundix'`
* Qtum/qtum `'Qtum'` or `'qtum'`
* Quant/qnt `'Quant'` or `'qnt'`
* Quantstamp/qsp `'Quantstamp'` or `'qsp'`
* Quantum Resistant Ledger/qrl `'Quantum Resistant Ledger'` or `'qrl'`
* Raiden Network Token/rdn `'Raiden Network Token'` or `'rdn'`
* Rarible/rari `'Rarible'` or `'rari'`
* Reef/reef `'Reef'` or `'reef'`
* Reserve Rights/rsr `'Reserve Rights'` or `'rsr'`
* Ripio Credit Network/rcn `'Ripio Credit Network'` or `'rcn'`
* Salt/salt `'Salt'` or `'salt'`
* Selfkey/key `'Selfkey'` or `'key'`
* Serum/srm `'Serum'` or `'srm'`
* Serve/serv `'Serve'` or `'serv'`
* SHIBA INU/shib `'SHIBA INU'` or `'shib'`
* Siacoin/sc `'Siacoin'` or `'sc'`
* SingularityNET/agix `'SingularityNET'` or `'agix'`
* SKALE Network/skl `'SKALE Network'` or `'skl'`
* SnowGem/sng `'SnowGem'` or `'sng'`
* SolarCoin/slr `'SolarCoin'` or `'slr'`
* Solana/sol `'Solana'` or `'sol'`
* SOLVE/solve `'SOLVE'` or `'solve'`
* Spendcoin/spnd `'Spendcoin'` or `'spnd'`
* Status/snt `'Status'` or `'snt'`
* Storj/storj `'Storj'` or `'storj'`
* Storm/storm `'Storm'` or `'storm'`
* StormX/stmx `'StormX'` or `'stmx'`
* Streamr/data `'Streamr'` or `'data'`
* SushiSwap/sushi `'SushiSwap'` or `'sushi'`,
* SuperFarm/super `'SuperFarm'` or `'super'` only erc-20 validation no bep-20 or polygon
* SuperRare/rare `'SuperRare'` or `'rare'`
* Swarm City/swt `'Swarm City'` or `'swt'`
* Swipe/sxp `'Swipe'` or `'sxp'`
* Synthetix Network/snx `'Synthetix Network'` or `'snx'`
* Tap/xtp `'Tap'` or `'xtp'`
* TEMCO/temco `'TEMCO'` or `'temco'`
* Tellor/trb `'Tellor'` or `'trb'`
* TenX/pay `'TenX'` or `'pay'`
* Tether/usdt `'Tether'` or `'usdt'`
* Terra Virtua Kolect/tvk `'Terra Virtua Kolect'` or `'tvk'`
* Tezos/xtz `'Tezos'` or `'xtz'`
* The Graph/grt `'The Graph'` or `'grt'`
* The Sandbox/sand `'The Sandbox'` or `'sand'`
* Tornado Cash/torn `'Tornado Cash'` or `'torn'`
* Tron/trx `'Tron'` or `'trx'`
* TrueUSD/tusd `'TrueUSD'` or `'tusd'`
* Ultra/uos `'Ultra'` or `'uos'`
* Uniswap Coin/uni `'Uniswap Coin'` or `'uni'`
* Universal Market Access/uma `'Universal Market Access'` or `'uma'`
* USD Coin/usdc `'USD Coin'` or `'usdc'`
* VeChain/vet `'VeChain'` or `'vet'`
* VertCoin/vtc `'VertCoin'` or `'vtc'`
* Verasity/vra `'Verasity'` or `'vra'`
* Viberate/vib `'Viberate'` or `'vib'`
* VIDT Datalink/vidt `'VIDT Datalink'` or `'vidt'`
* VoteCoin/vot `'VoteCoin'` or `'vot'`
* Waves/waves `'Waves'` or `'waves'`
* Wings/wings `'Wings'` or `'wings'`
* Wrapped Nexus Mutual/wnxm `'Wrapped Nexus Mutual'` or `'wnxm'`
* ZCash/zec `'ZCash'` or `'zec'`
* Yearn.finance/yfi `'yearn.finance'` or `'yfi'`
* Yield Guild Games/ygg `'Yield Guild Games'` or `'ygg'`
* ZClassic/zcl `'ZClassic'` or `'zcl'`
* ZenCash/zen `'ZenCash'` or `'zen'`


## Usage

```typescript
// TypeScript / ESM
import { validate } from '@fordefi/crypto-address-validator-ts';

validate('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin', null);              // true
validate('0x1111111111111111111111111111111111111111', 'eth', null);         // true
validate('mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef', 'btc', { networkType: 'testnet' });
```

```javascript
// CommonJS
const { validate } = require('@fordefi/crypto-address-validator-ts');

validate('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin', null);              // true
```

### Framework example

#### Angular directive
```typescript
import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import { validate } from '@fordefi/crypto-address-validator-ts';

@Directive({
  selector: '[ccyCode]',
  providers: [{provide: NG_VALIDATORS, useExisting: CryptoAddressValidationDirective, multi: true}]
})
export class CryptoAddressValidationDirective implements Validator {

  //For example BTC
  @Input() public ccyCode: string;

  public validate(field: AbstractControl): ValidationErrors | null {
    if (!validate(field.value, this.ccyCode, null)) {
      return {messageCode: 'Invalid bitcoin address'};
    }
    return null;
  }
}
```
#### HTML
```html
<input id="address"
       [ccyCode]="currency">
```


## Differences from upstream

Relative to `crypto-address-validator-ts` 0.5.11, the point this fork diverged from. See
[CHANGELOG.md](CHANGELOG.md) for per-release detail.

### Added

* **Solana** (`sol`) address validation.
* **Pearl** (`pearl`) address validation — bech32, HRP `prl` on mainnet and `tprl` on testnet.
* `Currency` and `Options` are exported from the package root.

### Changed

* Published under the `@fordefi/` scope.
* The build emits **CommonJS**, so the package loads in Node as well as in bundlers. Releases
  0.5.15–0.5.25 emitted ESM that Node could not resolve, and 0.5.12–0.5.14 emitted AMD.
* `validate()`'s third parameter accepts `null`.
* `Options.chainType` is optional — it is only consulted for USDT.
* Solana is validated by base58-decoding the address and requiring 32 bytes, rather than by
  constructing a `@solana/web3.js` `PublicKey`. Behaviour is unchanged; the dependency is gone.
* Only the package root is importable. Deep imports such as
  `@fordefi/crypto-address-validator-ts/dist/validators/...` are not part of the public API.
* Requires Node.js >= 20.19.

### Removed

* **The default export.** Use named imports.
* **Ripple (`xrp`), Baby Ripple (`babyxrp`), Stellar (`xlm`), Nano (`nano`) and RaiBlocks (`xrb`).**
  Their validators were deleted in 0.5.20. `validate()` **throws**
  `Missing validator for currency: <symbol>` for these — the one change that will silently break
  code migrating from upstream. Use `findCurrency(symbol)` to test for support without throwing.

## Development

```
npm ci
npm run build        # tsc -> dist/
npm test             # runs the suite twice: against src, then against the built dist
npm run lint:pkg     # publint + @arethetypeswrong/cli against a packed tarball
npm run lint:dead    # knip (see knip.jsonc)
npm run test:pack    # installs the packed tarball into a temp project and loads it
```

CI runs all of the above on Node 20.19, 22, 24 and 26.

The scripts assume a POSIX shell (`test:dist` uses `env`, and the smoke test shells out to
`npm` and `tar`).

## Releasing

Bump `version` in `package.json` and update `CHANGELOG.md` in the same pull request. When it merges to
`master`, CI compares the version against the npm registry and — if it is new — runs the full gate,
publishes, tags the commit `v<version>` and opens a GitHub Release. Merges that do not change the
version publish nothing.

Publishing uses npm trusted publishing (OIDC), so no npm token is stored in this repository and
provenance attestations are generated automatically. The release job runs only after CI has passed
for the same commit.

Two steps are not automated. After the first 0.6.0 publish, deprecate the names it replaces:

```
npm deprecate "@fordefi-public/crypto-address-validator-ts@*" "moved to @fordefi/crypto-address-validator-ts"
npm deprecate "@fordefi/crypto-address-validator-ts@<0.6.0" "not loadable by Node; upgrade to >=0.6.0"
```

The second matters because a caret range on a `0.x` version pins the minor: `^0.5.18` will never
resolve to `0.6.0`, so existing dependents must change their range by hand to receive the fix.
