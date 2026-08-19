# Changelog

All notable changes to this fork. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This project forked from [`crypto-address-validator-ts`](https://github.com/marksuurland/crypto-address-validator-ts)
at **0.5.11** (`3ceaffa`, 2022-07-01); upstream's later 0.5.12 was never merged. See that repository for
pre-fork history.

Releases moved between npm names over time:

| Versions | Published as |
|---|---|
| 0.5.12 – 0.5.18 | `@fordefi/crypto-address-validator-ts` |
| 0.5.18 – 0.5.25 | `@fordefi-public/crypto-address-validator-ts` |
| 0.6.0 onward | `@fordefi/crypto-address-validator-ts` |

## [Unreleased]

## [0.6.0] — unreleased

First release that Node can load. See [DEV-26502](https://fordefi.atlassian.net/browse/DEV-26502).

### Fixed

- **The published `dist/` can now be loaded by Node, not only by a bundler.** `tsconfig.json` emitted
  ESM while `package.json` declared CommonJS with no `"type"` and no `"exports"`, so `dist/index.js`
  contained extensionless ESM imports that Node's ESM resolver rejects with
  `Cannot find module '.../dist/currencies'`. Every release from **0.5.15 (2023-10-09)** onward shipped
  that output; 0.5.12–0.5.14 shipped AMD, which Node could not load either.
- jsSHA interop: the `jsSHA?.default ?? jsSHA` workaround, needed only by the ESM build, is gone.
- Three tests asserted the wrong thing and passed by accident: a nested `{ networkType: { networkType:
  'testnet' } }` and two options passed as the bare string `'testnet'`. All three fell through to the
  network-agnostic branch instead of exercising testnet.

### Changed

- **Breaking:** published as `@fordefi/crypto-address-validator-ts` again.
  `@fordefi-public/crypto-address-validator-ts` is deprecated.
- **Breaking:** only the package root is importable. Deep imports into `dist/` no longer resolve.
- **Breaking:** requires Node.js **>= 20.19**.
- Solana addresses are validated by base58-decoding and requiring 32 bytes, rather than by constructing
  a `@solana/web3.js` `PublicKey` — the same check that class performs. Verified against it across 4064
  generated and edge-case inputs. Dropping the dependency removes roughly 163 KB raw / 53 KB gzip from
  a bundle that does not otherwise use Solana, because the CommonJS build cannot tree-shake it.
- Both `Options` fields are now optional. `chainType` is only read by the USDT validator, and every
  validator already defaulted a missing `networkType`.
- `validate()`'s third parameter is now optional and typed `Options | null`, so the two-argument form used
  throughout the docs typechecks; previously TypeScript required all three arguments.
- Upgraded to TypeScript 6 with `strict`, and updated every remaining dependency.
- `buffer` moved from `devDependencies` to `dependencies`. It is required at package-import time and
  previously resolved only because `@solana/web3.js` happened to hoist it.
- `test` now runs the suite twice: against `src`, then against the built `dist`. Previously it forced
  `module: "commonjs"` through ts-node, so the published artifact was never executed.

### Added

- `Currency` and `Options` are exported from the package root.
- `"type"`, `"exports"`, `"files"`, `"engines"` and `"publishConfig"` fields. `"files"` also stops the
  tarball shipping `tests/`, `tsconfig.json`, `.github/` and `.vscode/`.
- Declaration maps, so editors resolve go-to-definition to the TypeScript sources.
- CI on Node 20.19, 22, 24 and 26: build, both test passes, `publint`, `@arethetypeswrong/cli`, and a
  smoke test that installs the packed tarball and loads it via `require()`, `import()` and a named import.
- Release automation: a merge to `master` that changes `version` publishes via npm trusted
  publishing (OIDC, with provenance attestations), then tags the commit and opens a GitHub Release.
- Solana vectors covering both encoded lengths of a 32-byte key, and invalid keys whose character count
  looks plausible but whose decoded length does not.
- This changelog.

### Removed

- **Breaking:** the default export on the package root, and on the internal currencies module. Use
  named imports: `import { validate } from '@fordefi/crypto-address-validator-ts'`.
- Dependencies `@solana/web3.js`, `js-sha512` and `base-x`.
- Dead code: `src/validators/base58_validator.ts` (orphaned in 0.5.22), `sha512_256()`, `hexToBytes()`
  and several unused imports. `numberToHex`, `blake256` and siacoin's `verifyChecksum` are no longer
  exported; they were only ever used inside their own modules.
- `index.html`, which loaded a test bundle removed in 2021.

## [0.5.25] — 2026-03-16

### Changed

- Pearl mainnet bech32 HRP is now `prl`; testnet stays `tprl`. (`6b83ffa`, #5)

## [0.5.24] — 2026-02-26

### Fixed

- Pearl bech32 HRP corrected from `td` to `tprl`. (`73cf9f6`, #4)

## [0.5.23] — 2026-02-18

### Added

- Pearl (`pearl`) address validation via bech32/segwit, HRP `td`. (`4097fb2`, `38cc0d3`, #2)

## [0.5.22] — 2025-05-27

### Changed

- Solana addresses are validated with `@solana/web3.js`'s `PublicKey` instead of a generic base58
  length check, which accepted addresses of the wrong decoded length. (`bb98159`, #1)

## [0.5.21] — 2024-04-07

### Fixed

- Solana `minLength` lowered from 43 to 32. (`e127162`)

## [0.5.20] — 2023-10-26

Published under `@fordefi-public/`. This release retargeted the build for Vite and, in the same
commit, removed five currencies.

### Changed

- Renamed to `@fordefi-public/crypto-address-validator-ts`.
- Build retargeted from `target: es5` / `module: amd` to `esnext` / `esnext`. **This is the change
  that made the output unloadable by Node**, though the same output had already shipped as
  `@fordefi@0.5.15` 17 days earlier. (`42742b9`)
- `validate()`'s third parameter accepts `null`.
- Added default exports to the root and currencies modules.

### Removed

- **Ripple (`xrp`), Baby Ripple (`babyxrp`), Stellar (`xlm`), Nano (`nano`) and RaiBlocks (`xrb`).**
  Their validators were deleted; `validate()` throws `Missing validator for currency: <symbol>` for
  these. The README continued to advertise them until 0.6.0.

## 0.5.12 – 0.5.18 — 2023-10-09 / 2023-10-10

First releases under the `@fordefi/` scope (`rony-arnac`). 0.5.12–0.5.14 emitted AMD; 0.5.15 onward
emitted ESM. None are loadable by Node. There is no corresponding commit in this repository for
0.5.18 as published under `@fordefi-public/`.

[Unreleased]: https://github.com/arnac-io/crypto-address-validator-ts/compare/master...HEAD
