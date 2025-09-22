import { defineConfig } from 'vite'

export default defineConfig({
  root: './web',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './web/index.html'
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})