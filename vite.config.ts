import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const serverExternals = [
  "@vercel/blob",
  "@vercel/blob/client",
  "@vercel/oidc",
  "firebase-admin",
  "firebase-admin/app",
  "firebase-admin/auth",
  "firebase-admin/firestore",
  "@google-cloud/firestore",
  "google-gax",
];

export default defineConfig({
  ssr: {
    external: serverExternals,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      rollupConfig: {
        external: serverExternals,
      },
      rolldownConfig: {
        external: serverExternals,
      },
    }),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
