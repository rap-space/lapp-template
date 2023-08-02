import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  /* 
    发布出来的资源不在域名根路径，这里直接禁用公共资源目录，
    JS内静态资源必须显式导入，保障资源base根据环境适配，防止线上引用出错。
  */
  publicDir: false,
  build: {
    target: 'es2015',
    outDir: 'build',
    rollupOptions: {
      output: {
        // 线上是非覆盖式发布，带版本号，构建产物的[hash]没有意义所以禁用掉
        entryFileNames: `[name].js`,
        chunkFileNames: `chunks/[name].js`,
        assetFileNames: `assets/[name].[ext]`, // 只托管css资源，图片等媒体资源请自行上传CDN后在代码内引用
      },
    },
  },
})
