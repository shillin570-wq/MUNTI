import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'node:url';
import {defineConfig, loadEnv} from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || '').trim().replace(/\/$/, '');

  return {
  plugins: [react(), tailwindcss(), {
    name: 'inject-og-site-url',
    transformIndexHtml(html) {
      if (!siteUrl) {
        console.warn(
          '\n[春秋模联] 未配置 VITE_SITE_URL：微信/QQ 链接预览将缺少有效 og:url / og:image。请复制 .env.example 为 .env 并填写 https 站点根地址（无末尾斜杠）。\n',
        );
        return html
          .replace(/\n\s*<meta property="og:url"[^>]*>\s*/g, '\n')
          .replace(/\n\s*<meta property="og:image"[^>]*>\s*/g, '\n')
          .replace(/\n\s*<meta name="twitter:image"[^>]*>\s*/g, '\n');
      }
      return html.replaceAll('%VITE_SITE_URL%', siteUrl);
    },
  }, cloudflare()],
  resolve: {
    alias: {
      '@': configDir,
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
};
});