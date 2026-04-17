import { defineConfig, transformWithOxc } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

const jsxInJs = () => ({
  name: 'transform-jsx-in-js',
  async transform(code, id) {
    if (!/\.js(?:\?|$)/.test(id) || id.includes('node_modules')) return null;
    return transformWithOxc(code, id, {
      lang: 'jsx',
      jsx: { runtime: 'automatic' },
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/cable': {
        target: 'ws://localhost:3000',
        ws: true,
      },
      '^/(?!src/|node_modules/|@|__vite).*': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass(req) {
          const accept = req.headers.accept || '';
          // Keep this route on Rails in local dev.
          if (req.url?.startsWith('/meetings/create')) return null;
          if (accept.includes('text/html')) return req.url;
          return null;
        },
      },
    },
  },
  plugins: [
    react({ include: /\.[tj]sx$/ }),
    babel({
      presets: [reactCompilerPreset()],
      parserOpts: { plugins: ['jsx'] },
    }),
    jsxInJs(),
  ],
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: { '.js': 'jsx' },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$app-name: "meetings" !default;\n@import "${
          fileURLToPath(new URL('./src/modules/common/styles/base.scss', import.meta.url))
        }";\n`,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'],
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.SENTRY_DSN_URL': JSON.stringify(process.env.SENTRY_DSN_URL || ''),
    'process.env.MIXPANEL_TOKEN_PRODUCTION': JSON.stringify(process.env.MIXPANEL_TOKEN_PRODUCTION || ''),
    'process.env.MIXPANEL_TOKEN_STAGING': JSON.stringify(process.env.MIXPANEL_TOKEN_STAGING || ''),
    'process.env.MIXPANEL_TOKEN_DEVELOPMENT': JSON.stringify(process.env.MIXPANEL_TOKEN_DEVELOPMENT || ''),
  },
  resolve: {
    alias: {
      '@common': fileURLToPath(new URL('./src/modules/common', import.meta.url)),
      '~meetings': fileURLToPath(new URL('./src/modules/meetings', import.meta.url)),
      '@meetings': fileURLToPath(new URL('./src/apps/meetings', import.meta.url)),
      '~analytics': fileURLToPath(new URL('./src/modules/analytics', import.meta.url)),
      '~video_player': fileURLToPath(new URL('./src/modules/video_player', import.meta.url)),
      '~charts': fileURLToPath(new URL('./src/modules/charts', import.meta.url)),
      '@tracking': fileURLToPath(new URL('./src/modules/tracking', import.meta.url)),
      '~notebook': fileURLToPath(new URL('./src/modules/notebook', import.meta.url)),
    },
  },
});
