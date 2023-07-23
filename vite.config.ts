import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        nesting: true
      }
    }
  },
  build: {
    cssMinify: 'lightningcss',
    outDir: 'docs'
  },
  plugins: [react()],
  base: 'pma-editor'
})
