import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/client/main.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2018'],
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  outfile: 'public/script.js',
  alias: { '@shared': './src/shared' },
});

esbuild.build({
  entryPoints: ['src/client/styles.css'],
  bundle: true,
  minify: true,
  outfile: 'public/styles.css',
});
