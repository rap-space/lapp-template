import fs from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import lappPlugin from './lapp-vite-plugin'

let pkgJson = {};
try {
  const pkgJsonBuffer = fs.readFileSync('package.json');
  pkgJson = JSON.parse(pkgJsonBuffer.toString());
} catch (error) {
  throw error;
}

/** 构造静态资源依赖路径 */
let base = `https://1688-lapp.oss-cn-hangzhou.aliyuncs.com/pc-pc_work-pc_work_plugin-${pkgJson.appKey}/${pkgJson.version}/`;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    lappPlugin(),
  ],
  base,
  build: {
    sourcemap: 'hidden',
    target: 'es2015',
    outDir: 'build',
    rollupOptions: {
      output: {
        // 线上是非覆盖式发布，URL带版本号，构建产物的[hash]没有意义，所以禁用掉
        entryFileNames: `[name].js`,
        chunkFileNames: `chunk/[name].js`,
        assetFileNames: `[name].[ext]`, // 只托管css资源，图片等媒体资源，请自行上传CDN后在代码内引用
      },
    },
  },
})
