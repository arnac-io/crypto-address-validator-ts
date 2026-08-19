#!/usr/bin/env node
/**
 * Installs the packed tarball into a throwaway project and exercises it the way a consumer
 * would. Guards DEV-26502, where the build emitted ESM that only a bundler could resolve.
 *
 * A fresh install is also what catches a runtime dependency that previously resolved only by
 * hoisting, and the assertions below cover both of 0.6.0's breaking changes.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG = require(path.join(ROOT, 'package.json')).name;
const VALID_ETH = '0x1111111111111111111111111111111111111111';

// stdout is captured, stderr is inherited: a dependency's deprecation warning must never be
// folded into a value we assert on. `shell` on Windows so `npm`/`tar` resolve to their .cmd
// shims.
const run = (cmd, args, opts = {}) =>
    execFileSync(cmd, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
        shell: process.platform === 'win32',
        ...opts,
    });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cav-smoke-'));
let ok = false;

try {
    if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) {
        throw new Error('dist/ is missing — run `npm run build` first.');
    }

    // --ignore-scripts: `npm pack` fires `prepare`, which builds. Without it a `test` that
    // packs would recurse through prepare -> build -> test -> pack.
    const tarball = run('npm', ['pack', '--ignore-scripts', '--pack-destination', tmp], { cwd: ROOT })
        .trim().split('\n').pop().trim();
    const tarPath = path.join(tmp, tarball);
    console.log(`packed ${tarball}`);

    const unpacked = path.join(tmp, 'unpacked');
    fs.mkdirSync(unpacked);
    run('tar', ['-xzf', tarPath, '-C', unpacked]);
    const packed = path.join(unpacked, 'package');

    for (const required of ['dist/index.js', 'dist/index.d.ts', 'CHANGELOG.md']) {
        if (!fs.existsSync(path.join(packed, required))) {
            throw new Error(`tarball is missing ${required} — check the "files" field`);
        }
    }

    const consumer = path.join(tmp, 'consumer');
    fs.mkdirSync(consumer);
    fs.writeFileSync(
        path.join(consumer, 'package.json'),
        JSON.stringify({ name: 'smoke-consumer', version: '1.0.0', private: true }) + '\n'
    );
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel', 'error', tarPath], {
        cwd: consumer,
        stdio: 'inherit',
    });

    // The bug itself. Requiring every emitted file is strictly stronger than pattern-matching
    // for `import`/`export`: Node fails on any syntax it cannot load as CommonJS and reports the
    // offending file and line itself. Run from the consumer, where dependencies resolve.
    const installedDist = path.join(consumer, 'node_modules', ...PKG.split('/'), 'dist');
    const emitted = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.js')) emitted.push(full);
        }
    };
    walk(installedDist);
    run('node', ['-e', `for (const f of ${JSON.stringify(emitted)}) require(f);`], { cwd: consumer });
    console.log(`loaded ${emitted.length} emitted dist/*.js files as CommonJS`);

    const checks = [
        ['require()', ['-e',
            `console.log(require('${PKG}').validate('${VALID_ETH}','eth'))`], 'true'],
        ['import()', ['--input-type=module', '-e',
            `import('${PKG}').then(m => console.log(m.validate('${VALID_ETH}','eth')))`], 'true'],
        ['named import', ['--input-type=module', '-e',
            `import {validate} from '${PKG}'; console.log(validate('${VALID_ETH}','eth'))`], 'true'],
        // a validator that returned a truthy constant would pass every check above
        ['rejects invalid', ['-e',
            `console.log(require('${PKG}').validate('not-an-address','eth'))`], 'false'],
        ['getCurrencies', ['-e',
            `console.log(require('${PKG}').getCurrencies().length > 0)`], 'true'],
        ['findCurrency', ['-e',
            `console.log(require('${PKG}').findCurrency('btc').symbol)`], 'btc'],
        // 0.6.0 removed the default export
        ['no default export', ['-e',
            `console.log(require('${PKG}').default === undefined)`], 'true'],
        // 0.6.0 stopped exposing subpaths
        ['deep import blocked', ['-e',
            `try { require('${PKG}/dist/currencies'); console.log('resolved') }` +
            ` catch (e) { console.log(e.code) }`], 'ERR_PACKAGE_PATH_NOT_EXPORTED'],
    ];

    for (const [label, args, expected] of checks) {
        const out = run('node', args, { cwd: consumer }).trim();
        if (out !== expected) {
            throw new Error(`${label} printed ${JSON.stringify(out)}, expected ${JSON.stringify(expected)}`);
        }
        console.log(`  ${label.padEnd(20)} ${out}`);
    }

    console.log('pack smoke test passed');
    ok = true;
} finally {
    // keep the evidence when something failed — this is the only step that inspects the
    // publishable artifact, and the tarball is what a reader needs
    if (ok) {
        fs.rmSync(tmp, { recursive: true, force: true });
    } else {
        console.error(`\nsmoke test artifacts retained at ${tmp}`);
    }
}
