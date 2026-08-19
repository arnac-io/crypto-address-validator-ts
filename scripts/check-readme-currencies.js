#!/usr/bin/env node
/**
 * Asserts the README's supported-currency list and `src/currencies.ts` agree in both directions.
 *
 * This drifts easily: a rename in `currencies.ts` silently invalidates the documented lookup name,
 * and `validate()` then throws for a value the README says works. Round 1 of DEV-26502 found three
 * such typos by hand; the `origin/master` merge introduced a fourth (`'Injective Protocol'` →
 * `'Injective'`), which is why this is a script rather than a one-off command.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { findCurrency, getCurrencies } = require(path.join(ROOT, 'dist', 'index.js'));

const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const start = readme.indexOf('### Supported crypto currencies');
const end = readme.indexOf('## Usage', start);
if (start === -1 || end === -1) {
    throw new Error('could not locate the supported-currency section in README.md');
}

// e.g. * Injective/inj `'Injective'` or `'inj'`
const BULLET = /^\* .+?\/(\S+) /;
const QUOTED = /`'([^']+)'`/g;

const bullets = readme.slice(start, end).split('\n').filter((line) => BULLET.test(line));
const unresolvable = [];
const documented = new Set();

for (const line of bullets) {
    const symbol = line.match(BULLET)[1];
    documented.add(symbol.toLowerCase());
    // every token the line tells a reader to pass must resolve, not just the symbol
    for (const token of [symbol, ...[...line.matchAll(QUOTED)].map((m) => m[1])]) {
        if (!findCurrency(token)) {
            unresolvable.push(`${token}  (README: ${line.trim()})`);
        }
    }
}

const undocumented = getCurrencies()
    .map((currency) => currency.symbol)
    .filter((symbol) => !documented.has(symbol.toLowerCase()));

const problems = [];
if (unresolvable.length) {
    problems.push(`README documents ${unresolvable.length} token(s) that do not resolve:\n  ` +
        unresolvable.join('\n  '));
}
if (undocumented.length) {
    problems.push(`${undocumented.length} currency symbol(s) are missing from the README: ` +
        undocumented.join(', '));
}

if (problems.length) {
    console.error(problems.join('\n\n'));
    process.exit(1);
}

console.log(`README and currencies.ts agree: ${bullets.length} bullets, ${getCurrencies().length} currencies`);
