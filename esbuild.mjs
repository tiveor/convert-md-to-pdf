import * as esbuild from "esbuild";
import { cpSync, mkdirSync, readdirSync } from "fs";

const isProduction = process.argv.includes("--production");
const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: !isProduction,
  minify: isProduction,
  loader: {
    ".css": "text",
  },
};

// Ship diagram and math renderers with the extension so export and preview work offline
function copyVendor() {
  mkdirSync("dist/vendor/katex/fonts", { recursive: true });
  cpSync("node_modules/mermaid/dist/mermaid.min.js", "dist/vendor/mermaid.min.js");
  cpSync("node_modules/@excalidraw/utils/dist/excalidraw-utils.min.js", "dist/vendor/excalidraw-utils.min.js");
  cpSync("node_modules/@excalidraw/utils/dist/excalidraw-utils.min.js.LICENSE.txt", "dist/vendor/excalidraw-utils.min.js.LICENSE.txt");
  cpSync("node_modules/katex/dist/katex.min.css", "dist/vendor/katex/katex.min.css");
  // woff2 is supported by every Chromium version we target, so the other font formats are skipped
  for (const font of readdirSync("node_modules/katex/dist/fonts").filter((f) => f.endsWith(".woff2"))) {
    cpSync(`node_modules/katex/dist/fonts/${font}`, `dist/vendor/katex/fonts/${font}`);
  }
}

copyVendor();

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete.");
}
