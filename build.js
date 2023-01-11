#!/usr/bin/env node
import {build} from "esbuild";


const options = {
    // logLevel: "info",
    // declaration: true,
    entryNames: "main",
    entryPoints: ['./src/index.ts'],
    // minify: process.env.NODE_ENV === 'production',
    minify: true,
    bundle: true,
    outdir: 'dist',
    platform: "node",
    splitting: true,
    format: 'esm',
    target: ['esnext'],
    sourcemap: true,
    banner: {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`, //very important this is required for axios to work
    }
}

build(options).catch(err => {
    process.stderr.write(err.stderr)
    process.exit(1)
})
