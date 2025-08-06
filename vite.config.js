import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

//const isProduction = process.env.NODE_ENV === 'production';
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('build');


export default defineConfig({
  plugins: [vue()],
  base: isProduction ? '/' : './', // Použi NODE_ENV pre Netlify
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          bootstrap: ['bootstrap'],
          lodash: ['lodash'],
        },
      },
    },
    chunkSizeWarningLimit: 1500 // Zvýši limit, aby Netlify nevyhadzovalo varovanie
  },
  server: {
    port: 64175,
  },
  resolve: {
    alias: {
      '@': '/src',
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  cache: false,
  optimizeDeps: {
    include: ['vue']
  }
})
