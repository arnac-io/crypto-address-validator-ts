// Resolves the module under test: `npm run test:src` uses the TypeScript sources,
// `npm run test:dist` uses the compiled CommonJS we publish.
import type * as Validator from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

const useDist = process.env.TEST_TARGET === 'dist';
if (useDist && !fs.existsSync(path.join(__dirname, '../dist/index.js'))) {
    throw new Error('TEST_TARGET=dist but dist/ is missing — run `npm run build` first.');
}

const subject: typeof Validator = require(useDist ? '../dist/index' : '../src/index');

export const validate = subject.validate;
export const getCurrencies = subject.getCurrencies;
export const findCurrency = subject.findCurrency;
