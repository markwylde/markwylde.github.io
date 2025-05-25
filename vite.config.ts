import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only chunk for client builds, not SSR builds
          if (process.env.npm_lifecycle_event === 'build:server') {
            return undefined
          }
          
          // Split pages into separate chunks for client only
          if (id.includes('src/pages/Home')) return 'page-home'
          if (id.includes('src/pages/About')) return 'page-about'
          if (id.includes('src/pages/Projects')) return 'page-projects'
          if (id.includes('src/pages/Contact')) return 'page-contact'
          
          // Split large dependencies
          if (id.includes('node_modules/react-router')) return 'react-router'
          if (id.includes('node_modules/react-dom')) return 'react-dom'
          if (id.includes('node_modules/react') && !id.includes('react-dom') && !id.includes('react-router')) return 'react'
        },
      },
    },
  },
})
