import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { default as esbuild, minify } from 'rollup-plugin-esbuild';

export default (_args) => {
    return {
        input: 'src/hono-webc.ts',
        output: {
            dir: 'dist',
            format: 'esm',
        },
        plugins: [
            // Strip TS
            esbuild(),
            // Map bare node imports to namespeces node imports
            alias({
                entries: {
                    'css-tree': 'css-tree/dist/csstree.esm',
                    fs: 'node:fs',
                    os: 'node:os',
                    path: 'node:path',
                    util: 'node:util',
                    stream: 'node:stream',
                    events: 'node:events',
                    crypto: 'node:crypto',
                    module: 'node:module',
                    vm: 'node:vm',
                },
            }),
            // node resolve modules
            resolve(),
            // cjs node modules
            commonjs(),
            // minify
            minify({ ignoreAnnotations: true }),
        ],
    };
};
