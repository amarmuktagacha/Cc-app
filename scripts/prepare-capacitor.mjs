import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, ".vercel/output/static");
const assets = join(output, "assets");
const index = readdirSync(assets).find((name) => /^index-[^/]+\.js$/.test(name));
const stylesheet = readdirSync(assets).find((name) => /^styles-[^/]+\.css$/.test(name));

if (!index) throw new Error("Vite client entry not found in .vercel/output/static/assets");

const css = stylesheet ? `    <link rel="stylesheet" href="/assets/${stylesheet}">\n` : "";
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#09090b">
${css}  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/assets/${index}"></script>
  </body>
</html>
`;

writeFileSync(join(output, "index.html"), html);
console.log(`[capacitor] wrote ${join(output, "index.html")}`);
