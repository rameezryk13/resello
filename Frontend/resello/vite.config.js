import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // '@' points at src/. Feature components sit five levels deep, where
    // '../../../../../api/client' is both unreadable and silently brittle
    // under any file move; '@/api/client' is neither.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
