import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
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
