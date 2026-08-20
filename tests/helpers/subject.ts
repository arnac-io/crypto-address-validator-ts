// Resolves the module under test: `npm run test:src` uses the TypeScript sources,
// `npm run test:dist` uses the compiled CommonJS we publish. Before DEV-26502 the suite only
// ever ran against src, so the published output was never executed.
import type * as Validator from '../../src/index';

/** `'src'` or `'dist'`; asserted by a test so a typo cannot silently fall back to src. */
export const target = process.env.TEST_TARGET ?? 'src';

/** The module path actually loaded, so a test can confirm which artifact ran. */
export const entry = target === 'dist' ? '../../dist/index' : '../../src/index';

const subject: typeof Validator = require(entry);

export const validate = subject.validate;
export const getCurrencies = subject.getCurrencies;
export const findCurrency = subject.findCurrency;

export type { AddressType, Currency, Options } from '../../src/index';
