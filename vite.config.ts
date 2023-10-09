import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import lappPlugin from './lapp-vite-plugin'
import { getJsonOrDie } from './script/misc/utils.mjs'
import { CDN_DOMAIN } from './script/misc/config.mjs'

/** 根据命令行入参，定义模式常量 */
const MODE = process.argv.indexOf('--watch') !== -1 ? 'development' : 'production';

/** 构造静态资源依赖路径 */
const { appKey, version } = getJsonOrDie('package.json');
const base = `https://${CDN_DOMAIN}/pc-pc_work-pc_work_plugin-${appKey}/${version}/`;

// https://cn.vitejs.dev/config/
export default defineConfig({
  mode: MODE,
  define: {
    // 指定 NODE_ENV 方便 react 等库动态依赖不同子包
    'process.env.NODE_ENV': JSON.stringify(MODE),
  },
  plugins: [
    react(),
    lappPlugin(),
  ],
  base,
  build: {
    sourcemap: MODE === 'development',
    minify: MODE === 'production',
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
