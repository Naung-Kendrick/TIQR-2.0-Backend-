
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: "TA'ANG LAND IMG TIQR",
          short_name: "TIQR System",
          description: "Ta'ang Land Immigration Image QR Code System",
          theme_color: '#0f172a',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      {
        name: 'mock-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/login' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { username, password } = JSON.parse(body);
                  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      token: 'mock-dev-token-' + Date.now(),
                      message: 'Development Mock Login Successful'
                    }));
                  } else {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      message: 'Invalid username or password (Mock API)'
                    }));
                  }
                } catch (e) {
                  res.statusCode = 400;
                  res.end('Invalid JSON');
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
    }
  };
});
