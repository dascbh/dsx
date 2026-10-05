import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

function requireAttachmentsHost(): Plugin {
  return { name: 'require-attachments-host', config() { if (!/^attachments-[0-9]{12}\.s3\.[a-z0-9-]+\.amazonaws\.com$/.test(process.env.VITE_ATTACHMENTS_HOST ?? '')) throw new Error('VITE_ATTACHMENTS_HOST'); } };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), requireAttachmentsHost()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
