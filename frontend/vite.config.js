import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // ✅ ADD THIS LINE


export default defineConfig({
  plugins: [
    react(),        
   
  ],
})
