import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");
const readJson = async (rel) => JSON.parse(await read(rel));

// The production-readiness contract — what hardening any AI Studio prototype must
// achieve. It asserts the production *shape*, not a specific catalogue or brand, so
// it holds for whatever shop you built. A raw export fails several of these; the
// hardened app passes them all.

// --- Structure: data is separated from markup ---
const html = await read("./index.html");
const css = await read("./css/index.css");
const appJs = await read("./js/app.js");
assert.doesNotMatch(html, /__PRODUCTS__|products\s*[:=]\s*\[/i, "product data must not be inlined in index.html");
assert.match(appJs, /fetch\(["']data\/products\.json["']\)/, "the app must load data from data/products.json");
const data = await readJson("./data/products.json");
assert.ok(Array.isArray(data.products) && data.products.length > 0, "products are required");
for (const p of data.products) {
  for (const key of ["id", "name", "price", "stock", "emoji", "alt"]) {
    assert.ok(p[key] !== undefined && p[key] !== "", `product ${p.id || "?"} needs ${key}`);
  }
}

// --- Routes ---
assert.match(html, /id="shop"/, "shop view is required");
assert.match(html, /id="about"/, "about view is required");
assert.match(html, /href="#\/about"/, "an about route link is required");

// --- Accessibility / responsive ---
assert.match(html, /<html lang=/, "a11y: <html lang> is required");
assert.match(html, /name="viewport"/, "a11y: viewport meta is required");
assert.match(html, /aria-label/, "a11y: landmarks/controls must be labelled");
assert.match(css, /@media/, "responsive styles are required");

// --- Docs: the hardening deliverables ---
const readme = await read("./README.md");
assert.ok(readme.trim().length > 200, "README.md must meaningfully describe the app");
assert.match(readme, /AI Studio/i, "README.md should record the AI Studio origin");
const deploy = await read("./DEPLOY.md");
assert.match(deploy, /static/i, "DEPLOY.md must cover static hosting");

console.log("Static verification passed.");
