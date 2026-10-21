import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [
    {
      // esbuild bundles .css imports as text (see esbuild.mjs); vitest would otherwise resolve them to ""
      name: "css-as-text",
      enforce: "pre",
      async resolveId(source, importer) {
        if (!source.endsWith(".css") || !importer) { return null; }
        const resolved = await this.resolve(source, importer, { skipSelf: true });
        return resolved ? `${resolved.id}?raw` : null;
      },
    },
  ],
  test: {
    include: ["src/**/*.test.ts"],
    // Let the css-as-text plugin above handle .css; vitest would otherwise stub them to ""
    css: true,
    alias: {
      vscode: path.resolve(__dirname, "src/__mocks__/vscode.ts"),
    },
  },
});
