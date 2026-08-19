#!/usr/bin/env node
/**
 * Installs the packed tarball into a throwaway project and loads it, so the artifact we
 * publish is exercised the way a consumer would exercise it. Guards DEV-26502, where the
 * build emitted ESM that only a bundler could resolve.
 *
 * A fresh install is also what catches a runtime dependency that previously resolved only
 * by hoisting.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG = require(path.join(ROOT, 'package.json')).name;
const ADDRESS = '0x1111111111111111111111111111111111111111';

// stdout is captured, stderr is inherited: a dependency's deprecation warning must never be
// folded into a value we assert on.
const run = (cmd, args, opts = {}) =>
    execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cav-smoke-'));

try {
    if (!fs.existsSync(path.join(ROOT, 'dist', 'index.js'))) {
        throw new Error('dist/ is missing — run `npm run build` first.');
    }

    // --ignore-scripts: `npm pack` fires `prepare`, which builds. Without it a `test` that
    // packs would recurse through prepare -> build -> test -> pack.
    const tarball = run('npm', ['pack', '--ignore-scripts', '--pack-destination', tmp], { cwd: ROOT })
        .trim().split('\n').pop().trim();
    console.log(`packed ${tarball}`);

    const unpacked = path.join(tmp, 'unpacked');
    fs.mkdirSync(unpacked);
    run('tar', ['-xzf', path.join(tmp, tarball), '-C', unpacked]);
    const packed = path.join(unpacked, 'package');

    for (const required of ['dist/index.js', 'dist/index.d.ts']) {
        if (!fs.existsSync(path.join(packed, required))) {
            throw new Error(`tarball is missing ${required} — check the "files" field`);
        }
    }

    // The bug itself: ESM syntax in a file Node loads as CommonJS. Only dist/ is checked —
    // src/ ships for the declaration maps, is never loaded by Node, and two of the vendored
    // externals are authored as ESM.
    const emitted = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.js')) emitted.push(full);
        }
    };
    walk(path.join(packed, 'dist'));

    const esm = emitted.filter((f) => /^\s*(import|export)\s/m.test(fs.readFileSync(f, 'utf8')));
    if (esm.length) {
        const names = esm.map((f) => path.relative(packed, f));
        throw new Error(`ESM syntax found in CommonJS output: ${names.join(', ')}`);
    }
    console.log(`checked ${emitted.length} emitted dist/*.js files — no ESM syntax`);

    const consumer = path.join(tmp, 'consumer');
    fs.mkdirSync(consumer);
    fs.writeFileSync(
        path.join(consumer, 'package.json'),
        JSON.stringify({ name: 'smoke-consumer', version: '1.0.0', private: true }) + '\n'
    );
    run('npm', ['install', '--no-audit', '--no-fund', '--loglevel', 'error', path.join(tmp, tarball)], {
        cwd: consumer,
        stdio: 'inherit',
    });

    const checks = [
        ['require()', ['-e', `console.log(require('${PKG}').validate('${ADDRESS}','eth'))`]],
        ['import()', ['--input-type=module', '-e',
            `import('${PKG}').then(m => console.log(m.validate('${ADDRESS}','eth')))`]],
        ['named import', ['--input-type=module', '-e',
            `import {validate} from '${PKG}'; console.log(validate('${ADDRESS}','eth'))`]],
    ];

    for (const [label, args] of checks) {
        const out = run('node', args, { cwd: consumer }).trim();
        if (out !== 'true') {
            throw new Error(`${label} printed ${JSON.stringify(out)}, expected "true"`);
        }
        console.log(`  ${label.padEnd(13)} true`);
    }

    console.log('pack smoke test passed');
} finally {
    fs.rmSync(tmp, { recursive: true, force: true });
}
