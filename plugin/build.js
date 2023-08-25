#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build } = require('esbuild');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const glob = require('glob');

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

build(options).then(() => {
    buildJobs();
    buildConnectScripts();
}).catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
});

// Build jobs directory for bree
function buildJobs() {
    const jobsOptions = {
        // logLevel: "info",
        // declaration: true,
        entryPoints: glob.sync('./src/infrastructure/driving/adapter/bulkSync/jobs/*.ts'),
        // minify: process.env.NODE_ENV === 'production',
        minify: true,
        bundle: true,
        outdir: 'dist/jobs',
        platform: 'node',
        target: ['esnext'],
        sourcemap: true,
    };

    build(jobsOptions).catch((err) => {
        process.stderr.write(err.stderr);
        process.exit(1);
    });
}

function buildConnectScripts() {
    const jobsOptions = {
        // logLevel: "info",
        // declaration: true,
        entryPoints: glob.sync('./scripts/*.ts'),
        // minify: process.env.NODE_ENV === 'production',
        minify: false,
        bundle: true,
        outdir: 'dist/scripts',
        platform: 'node',
        target: ['esnext'],
        sourcemap: true,
    };

    build(jobsOptions).catch((err) => {
        process.stderr.write(err.stderr);
        process.exit(1);
    });
}
