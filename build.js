#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build } = require('esbuild');

const options = {
    // logLevel: "info",
    // declaration: true,
    entryNames: 'main',
    entryPoints: ['./src/index.ts'],
    // minify: process.env.NODE_ENV === 'production',
    minify: true,
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: ['esnext'],
    sourcemap: true,
};

build(options).catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
});
