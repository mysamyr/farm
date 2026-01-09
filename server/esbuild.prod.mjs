import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server/server.ts'],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  minify: true,
  sourcemap: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  external: ['socket.io', 'socket.io-client'],
  outfile: 'dist/server.js',
});
