#!/usr/bin/env node
/**
 * Bundles the package for a browser and runs every validator inside the bundle.
 *
 * 0.6.0 shipped a crash that no existing check could see. `require('jssha')` was resolved
 * through the `import` condition by rolldown-vite, which hands back the ESM namespace object
 * instead of the constructor, so `new jsSHA(...)` threw "jsSHA is not a constructor" and took
 * the consumer's React tree down with it. The suite, `publint`, `attw` and the pack smoke test
 * all passed, because every one of them loads the package under Node's CommonJS resolution.
 *
 * The conditions below are deliberately the arnac frontend's (`frontend/vite-shared.config.ts`),
 * which omit `require` — that omission is what makes the resolution diverge from Node's.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG = require(path.join(ROOT, 'package.json')).name;

// Probes shaped to get past each validator's cheap checks and into its hash/checksum path,
// which is where the interop bug lived. Correctness is the suite's job; this asserts that
// bundling for a browser does not change behaviour.
const PROBES = [
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    '0x1111111111111111111111111111111111111111',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'DdzFFzCqrhsfdzUZxvuBkhV8Lpm9p43p9ubh79GCTkxJikAjKh51qhtCFMqUniC5tv5ZExyvSmAte2Du2tGimavSo6qSgXbjiy8qZRTg',
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    'tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8',
    '4swhHtxKapQbj3TZEipgtp7NQzcRWDYqCxXYoPQWjGyHmhxS1w1TjUEszCQT1sQucGwmPQMYdv1FYs3d51KgoubviPBf',
    // 95 base58 characters that overflow a cnBase58 block — the input that used to make the
    // Monero validator throw a bare 'Overflow' string out of validate().
    '48jzMhc4qbNAQBaBrKmzY5cP1yqLwrCFhtwvNa2Nsm42gnwGoDh7v4Rn8oaTBdWSuLYsdWo2y1U1oNM7T2AVLc9k7CxE5FT',
    'not-an-address',
    '',
];

// A handful of addresses whose verdict must survive bundling, so this catches a validator that
// stops throwing but starts answering wrongly.
const EXPECTED = [
    ['1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'bitcoin', true],
    ['1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN3', 'bitcoin', false],
    ['TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 'trx', true],
    ['0x1111111111111111111111111111111111111111', 'eth', true],
    ['not-an-address', 'eth', false],
    ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'sol', true],
    ['0OIl', 'sol', false],
    ['DdzFFzCqrhsfdzUZxvuBkhV8Lpm9p43p9ubh79GCTkxJikAjKh51qhtCFMqUniC5tv5ZExyvSmAte2Du2tGimavSo6qSgXbjiy8qZRTg', 'ada', true],
    ['tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8', 'xtz', true],
    ['47zQ5LAivg6hNCgijXSEFVLX7mke1bgM6YGLFaANDoJbgXDymcAAZvvMNt2PmMpqEe5qRy2zyfMYXdwpmdyitiFh84xnPG2', 'monero', true],
    ['48jzMhc4qbNAQBaBrKmzY5cP1yqLwrCFhtwvNa2Nsm42gnwGoDh7v4Rn8oaTBdWSuLYsdWo2y1U1oNM7T2AVLc9k7CxE5FT', 'monero', false],
];

const run = (cmd, args, opts = {}) =>
    execFileSync(cmd, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
        shell: process.platform === 'win32',
        ...opts,
    });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cav-browser-'));
let ok = false;
try {
    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'browser-smoke', private: true, type: 'module' }));

    fs.writeFileSync(
        path.join(tmp, 'entry.js'),
        `import { validate, getCurrencies } from ${JSON.stringify(PKG)};
        const PROBES = ${JSON.stringify(PROBES)};
        const EXPECTED = ${JSON.stringify(EXPECTED)};
        export function run() {
            const crashed = new Set();
            let calls = 0;
            for (const currency of getCurrencies()) {
                for (const name of [currency.symbol, currency.name].filter(Boolean)) {
                    for (const probe of PROBES) {
                        for (const opts of [null, { networkType: 'both' }, { networkType: 'testnet' }]) {
                            calls++;
                            try { validate(probe, name, opts); } catch (e) { crashed.add(name); }
                        }
                    }
                }
            }
            const wrong = [];
            for (const [address, currency, expected] of EXPECTED) {
                let actual;
                try { actual = validate(address, currency, null); } catch (e) { actual = 'threw ' + e; }
                if (actual !== expected) wrong.push(currency + ': expected ' + expected + ', got ' + actual);
            }
            return { calls, currencies: getCurrencies().length, crashed: [...crashed].sort(), wrong };
        }`,
    );

    fs.writeFileSync(
        path.join(tmp, 'vite.config.js'),
        `export default {
            // frontend/vite-shared.config.ts in arnac — note the absent \`require\` condition.
            resolve: { conditions: ['browser', 'import', 'module', 'default'] },
            build: {
                outDir: 'out', minify: false, target: 'esnext', write: true,
                lib: { entry: 'entry.js', formats: ['es'], fileName: 'bundle' },
                commonjsOptions: { transformMixedEsModules: true },
            },
            logLevel: 'warn',
        };`,
    );

    // The package under test comes from the working tree, so this checks what would be
    // published rather than what is already on the registry.
    run('npm', ['install', '--no-audit', '--no-fund', '--install-links', ROOT, 'vite'], { cwd: tmp });
    run('npx', ['vite', 'build'], { cwd: tmp });

    const result = JSON.parse(
        run('node', [
            '--input-type=module',
            '-e',
            `const m = await import(${JSON.stringify(path.join(tmp, 'out', 'bundle.js'))});
             process.stdout.write(JSON.stringify(m.run()));`,
        ]),
    );

    console.log(`bundled for browser and ran ${result.calls} validate() calls over ${result.currencies} currencies`);

    // validate() answers true or false; it never throws for a malformed address.
    if (result.crashed.length) {
        throw new Error(`validate() threw for ${result.crashed.join(', ')} when bundled for a browser`);
    }
    if (result.wrong.length) {
        throw new Error(`wrong verdict in a browser bundle:\n  ${result.wrong.join('\n  ')}`);
    }

    console.log(`  ${EXPECTED.length} verdicts match Node, no validator threw`);
    console.log('browser smoke test passed');
    ok = true;
} finally {
    if (ok) {
        fs.rmSync(tmp, { recursive: true, force: true });
    } else {
        console.error(`\nleaving the failed build in place for inspection: ${tmp}`);
    }
}
