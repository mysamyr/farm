import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['client/main.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2018'],
  minify: true,
  sourcemap: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'none',
  outfile: 'public/script.js',
});

esbuild.build({
  entryPoints: ['client/styles.css'],
  bundle: true,
  minify: true,
  outfile: 'public/styles.css',
});
