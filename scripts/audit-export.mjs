import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
const root = "out";
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";
const walk = async (d) =>
  (
    await Promise.all(
      (await readdir(d, { withFileTypes: true })).map(async (x) =>
        x.isDirectory() ? walk(join(d, x.name)) : [join(d, x.name)],
      ),
    )
  ).flat();
const files = await walk(root);
const htmls = files.filter((p) => p.endsWith(".html"));
let refs = 0;
for (const file of htmls) {
  const html = await readFile(file, "utf8");
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!href.startsWith("/") || href.startsWith("//") || href.includes("&lt;"))
      continue;
    const path = decodeURIComponent(href.split(/[?#]/)[0]);
    assert.ok(
      !prefix || path.startsWith(prefix + "/"),
      `Base path missing ${file} ${path}`,
    );
    const relative = path.slice(prefix.length);
    const dest = join(root, relative);
    let ok = false;
    for (const candidate of [dest, join(dest, "index.html"), dest + ".html"])
      try {
        if ((await stat(candidate)).isFile()) ok = true;
      } catch {}
    assert.ok(ok, `Missing local reference ${file} ${href}`);
    refs++;
  }
  if (!file.includes("404") && !file.includes("_not-found")) {
    assert.ok(/rel="canonical"/.test(html), `Missing canonical: ${file}`);
    assert.ok(/property="og:image"/.test(html), `Missing OG image: ${file}`);
  }
}
const homepage = await readFile(join(root, "index.html"), "utf8");
const srcs = [
  ...new Set(
    [...homepage.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
  ),
];
let gzip = 0;
for (const src of srcs)
  gzip += gzipSync(await readFile(join(root, src.slice(prefix.length)))).length;
const report = {
  htmlPages: htmls.length,
  localReferencesChecked: refs,
  homeInitialScripts: srcs.length,
  homeInitialJavascriptGzipBytes: gzip,
  adminExported: files.some((f) => f.includes("/admin/")),
  note: "Measured local export size; not a real-user Core Web Vitals measurement.",
};
assert.equal(report.adminExported, false);
assert.ok(gzip < 200 * 1024, "Initial JS exceeds 200 KiB gzip budget");
await writeFile(
  "docs/verification/export-results.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
