import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
        port: 5173,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/'))
                        return 'react-vendor';
                    if (id.includes('node_modules/react-router') || id.includes('node_modules/framer-motion/'))
                        return 'ui-vendor';
                },
            },
        },
        chunkSizeWarningLimit: 500,
    },
});
