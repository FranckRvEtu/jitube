import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteChatPlugin } from './src/api/chat/route';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env.VITE_MISTRAL_API_KEY = process.env.VITE_MISTRAL_API_KEY || 'brNz25J6etEr4sQszhk8quLT9SlvRqTt';

  return {
    plugins: [
      react(),
      viteChatPlugin(),
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Make env variables available to the server middleware
    define: {
      'process.env.VITE_MISTRAL_API_KEY': JSON.stringify(process.env.VITE_MISTRAL_API_KEY),
    },
  };
});
