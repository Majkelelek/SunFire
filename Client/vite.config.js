import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // DODAJ TO: Wymusza, aby ścieżki do assets zaczynały się od / (np. /assets/...)
  envDir: '../', // Wskazuje, że .env jest jeden poziom wyżej
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Czyści folder przed nowym buildem
  }
})