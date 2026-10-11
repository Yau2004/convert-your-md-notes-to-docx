import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

await mkdir(new URL("../docs/", import.meta.url), { recursive: true });
await Promise.all([
  copyFile(new URL("./index.html", import.meta.url), new URL("../docs/index.html", import.meta.url)),
  copyFile(new URL("./styles.css", import.meta.url), new URL("../docs/styles.css", import.meta.url)),
]);
await build({
  entryPoints: [fileURLToPath(new URL("./app.js", import.meta.url))],
  bundle: true,
  platform: "browser",
  format: "iife",
  loader: { ".md": "text" },
  outfile: fileURLToPath(new URL("../docs/app.js", import.meta.url)),
});
