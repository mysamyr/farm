import esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

async function run() {
  const jsCtx = await esbuild.context({
    entryPoints: ['src/client/main.ts'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/script.js',
    platform: 'browser',
    format: 'iife',
    target: ['es2018'],
    define: { 'process.env.NODE_ENV': '"development"' },
    alias: { '@shared': './src/shared' },
  });

  const cssCtx = await esbuild.context({
    entryPoints: ['src/client/styles.css'],
    bundle: true,
    outfile: 'public/styles.css',
  });

  if (!isWatch) {
    await jsCtx.rebuild();
    await cssCtx.rebuild();
    // eslint-disable-next-line n/no-process-exit
    process.exit(0);
    return;
  }
  await jsCtx.watch();
  await cssCtx.watch();

  console.log('[client:dev] Watching JS and CSS with esbuild...');
}

run();
