import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: {
        tsconfig: './tsconfig.package.json',
    },
    tsconfig: './tsconfig.package.json',
    sourcemap: true,
    clean: true,
    splitting: false,
    bundle: true,
    treeshake: true,
    external: [
        'next',
        'next/dynamic',
        'react',
        'react-dom',
        '@monaco-editor/react',
        'react-filerobot-image-editor',
        '@supabase/supabase-js',
    ],
    esbuildOptions(options) {
        options.loader = {
            ...options.loader,
            '.css': 'css',
            '.module.css': 'local-css',
        };
    },
});