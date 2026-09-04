import { resolve } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fast-mp4-converter',
      configureServer: (server: ViteDevServer) => {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

          if (req.url === '/api/convert-mp4' && req.method === 'POST') {
            try {
              const tempDir = os.tmpdir();
              const inputPath = path.join(tempDir, `rec_${Date.now()}.webm`);
              const outputPath = path.join(tempDir, `rec_${Date.now()}.mp4`);

              const chunks: Buffer[] = [];
              req.on('data', (chunk) => chunks.push(chunk));
              req.on('end', () => {
                const buffer = Buffer.concat(chunks);
                fs.writeFileSync(inputPath, buffer);

                // Run native Apple Silicon ffmpeg
                const ffmpegBin = fs.existsSync('/opt/homebrew/bin/ffmpeg')
                  ? '/opt/homebrew/bin/ffmpeg'
                  : 'ffmpeg';

                const proc = spawn(ffmpegBin, [
                  '-y',
                  '-i', inputPath,
                  '-c:v', 'libx264',
                  '-preset', 'ultrafast',
                  '-c:a', 'aac',
                  outputPath,
                ]);

                proc.on('close', (code) => {
                  if (code === 0 && fs.existsSync(outputPath)) {
                    const videoData = fs.readFileSync(outputPath);
                    res.writeHead(200, {
                      'Content-Type': 'video/mp4',
                      'Content-Length': videoData.length,
                    });
                    res.end(videoData);

                    // Clean up temp files
                    try { fs.unlinkSync(inputPath); } catch {}
                    try { fs.unlinkSync(outputPath); } catch {}
                  } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('FFmpeg conversion failed');
                  }
                });
              });
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end(String(err));
            }
            return;
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      features: resolve(__dirname, 'src/features'),
      components: resolve(__dirname, 'src/components'),
      hooks: resolve(__dirname, 'src/hooks'),
      contexts: resolve(__dirname, 'src/contexts'),
      services: resolve(__dirname, 'src/services'),
      styles: resolve(__dirname, 'src/styles'),
      assets: resolve(__dirname, 'src/assets'),
    },
  },
});
