import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || env.PORT || '5173', 10);

  const allowedHosts = [
    'kjgspl-kayentics-agent-frontend.onrender.com',
    '.onrender.com',
    'localhost',
    '127.0.0.1'
  ];

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      host: true,
      port: port,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
      },
    },
    preview: {
      host: true,
      port: port,
      allowedHosts: allowedHosts,
    },
  }
})

