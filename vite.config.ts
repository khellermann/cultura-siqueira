import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  ssr: {
    noExternal: [
      "firebase-admin",
      "firebase-admin/app",
      "firebase-admin/auth",
      "firebase-admin/firestore",
      "@google-cloud/firestore",
      "google-gax",
    ],
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      rollupConfig: {
        external: [],
      },
      rolldownConfig: {
        external: [],
      },
    }),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
