# The production-readiness contract

This folder is **not an app**. It is the portable contract you hold your *own* AI
Studio export to — the bar that turns a prototype into something maintainable and
deployable. You build a small shop in AI Studio, export it to Antigravity, drop
these three files into the exported project, and harden until both checks pass.

```
tests/shop.test.js   unit tests for the pure helpers your app must expose
verify.mjs           static audit of structure, accessibility, data, and docs
package.json         `npm test` → node --test && node verify.mjs
```

## What "production-ready" means here

The contract asserts the production *shape*, not a specific catalogue or brand, so
it holds for whatever shop you built:

- **Data out of markup** — products live in `data/products.json` (each with
  `id, name, price, stock, emoji, alt`) and the app loads them with
  `fetch("data/products.json")`; nothing is inlined in `index.html`.
- **Pure, tested helpers** in `js/shop.js` — `resolveRoute`, `formatPrice`,
  `inStock`, `summarize`, and a `ROUTES` list.
- **A tiny hash router** — `#/shop`, `#/about`, and a friendly not-found view.
- **Accessible + responsive** — `<html lang>`, a viewport meta, `aria-label`s, and
  at least one `@media` rule.
- **Docs** — a `README.md` that records the AI Studio origin, and a `DEPLOY.md`
  for static hosting (and no secrets shipped).

## Use it

```bash
# inside your exported, hardened project (Node.js 20+):
node --test        # the pure helpers in js/shop.js
node verify.mjs    # structure, accessibility, data, docs
```

A raw export fails several of these; a hardened app passes them all. See the
[`reference/`](../reference) folder for one worked example (the *Sora Stationery*
shop) that meets the whole contract.
