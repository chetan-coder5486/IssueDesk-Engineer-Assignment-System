import { defineConfig } from 'vite'
import taiwindcss from 'tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),taiwindcss()],
})
