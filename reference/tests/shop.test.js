import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveRoute, formatPrice, inStock, summarize, ROUTES } from "../js/shop.js";

// The catalogue is your own — these tests assert the production *shape*, not a
// specific set of products, so they hold for any small shop you harden.
async function catalog() {
  return JSON.parse(await readFile(new URL("../data/products.json", import.meta.url), "utf8")).products;
}

// --- Routing ----------------------------------------------------------------

test("resolveRoute maps known hashes", () => {
  assert.equal(resolveRoute("#/shop"), "shop");
  assert.equal(resolveRoute("#/about"), "about");
});

test("resolveRoute defaults to shop and falls back to 404", () => {
  assert.equal(resolveRoute(""), "shop");
  assert.equal(resolveRoute("#/"), "shop");
  assert.equal(resolveRoute("#/nope"), "404");
});

test("every declared route is reachable", () => {
  for (const r of ROUTES) assert.equal(resolveRoute(`#/${r}`), r);
});

// --- Pricing + inventory ----------------------------------------------------

test("formatPrice renders whole cents as dollars", () => {
  assert.equal(formatPrice(1200), "$12.00");
  assert.equal(formatPrice(0), "$0.00");
});

test("inStock excludes sold-out products", async () => {
  const products = await catalog();
  assert.ok(inStock(products).every((p) => p.stock > 0));
  assert.ok(inStock(products).length < products.length, "catalogue should include a sold-out item");
});

test("summarize counts in-stock and sold-out", async () => {
  const products = await catalog();
  const s = summarize(products);
  assert.equal(s.count, products.length, "count is the catalogue size");
  assert.equal(s.inStock + s.soldOut, s.count, "every product is in-stock or sold-out");
  assert.equal(s.inStock, inStock(products).length, "inStock count matches the inStock() filter");
  assert.ok(s.soldOut >= 1, "include at least one sold-out item to exercise the sold-out state");
});
