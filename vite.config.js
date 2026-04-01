import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    var normalizedId = id.replace(/\\/g, '/');
                    var has = function (value) { return normalizedId.indexOf(value) >= 0; };
                    if (!has('node_modules')) {
                        return;
                    }
                    if (has('react-router-dom') ||
                        has('node_modules/react/') ||
                        has('node_modules/react-dom/')) {
                        return 'react-vendor';
                    }
                    if (has('recharts')) {
                        return 'charts-vendor';
                    }
                    if (has('framer-motion')) {
                        return 'motion-vendor';
                    }
                    if (has('lucide-react')) {
                        return 'icons-vendor';
                    }
                },
            },
        },
    },
    test: {
        environment: 'node',
        globals: true,
        clearMocks: true,
    },
});
