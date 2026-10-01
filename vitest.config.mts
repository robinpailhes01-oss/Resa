import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { NODE_ENV: "test" },
    // Les tests d'intégration partagent la même base : fichiers exécutés l'un après l'autre.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src"), "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts") },
  },
});
