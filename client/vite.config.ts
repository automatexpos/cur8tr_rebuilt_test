import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Robust dirname resolution for different environments
function getDirname() {
  try {
    // Try import.meta.dirname first (Node 20.11+)
    if (typeof import.meta.dirname !== 'undefined') {
      return import.meta.dirname;
    }
    // Fall back to computing from import.meta.url
    return dirname(fileURLToPath(import.meta.url));
  } catch {
    // Last resort: use process.cwd() + 'client' for Vercel build environment
    return path.join(process.cwd(), 'client');
  }
}

const __dirname = getDirname();

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "..", "dist", "public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
