# Papershop: Sora Stationery — The Kyoto Virtual Archive

A dreamy, whimsical stationery pop-up shop featuring cozy notebooks, washi tapes, fountain pens, and inks, modeled after a botanical sanctuary in Kyoto.

This production-ready application has been hardened from a raw **Google AI Studio** export prototype.

## AI Studio Origin & Metadata

- **AI Studio App**: Sora Stationery (Papershop)
- **App URL**: https://ai.studio/apps/fdac9354-7ead-4157-94f1-c0bf62798683
- **Export Date**: June 28, 2026

### The Build & Hardening Prompt

```text
This is a raw AI Studio export prototype. Harden it into a maintainable, production-ready static app, without changing what the shop looks like: move the product data out of index.html (it's inlined as window.__PRODUCTS__) into data/products.json and fetch it in js/app.js; implement the pure helpers in js/shop.js — resolveRoute, formatPrice, inStock, summarize — and add a tiny hash router with #/shop, #/about, and a friendly not-found view; keep it fully static and accessible (html lang, viewport, aria-labels). Add a README.md that records the AI Studio origin and the build prompt, and a DEPLOY.md with static-hosting notes; make sure no secrets (the GEMINI_API_KEY) ship. It is done only when both `node --test` and `node verify.mjs` pass — read tests/shop.test.js and verify.mjs for the exact contract and don't weaken them.
```

---

## Technical Hardening Accomplished

1. **Separation of Concerns**: Moved catalog product data from the HTML body into `data/products.json`. Inlined variables were fully purged.
2. **Modular Helper Functions**: Pure functions (`resolveRoute`, `formatPrice`, `inStock`, `summarize`) implemented in `js/shop.js` and covered by Node.js native unit tests (`tests/shop.test.js`).
3. **Vanilla Hash Routing**: Introduced a lightweight routing mechanism managing `#/shop`, `#/about`, and a friendly `#/not-found` view without bloated external routers.
4. **Enhanced Accessibility & Standards**:
   - Explicit `<html lang="en">` declaration.
   - Standard viewport configuration.
   - Screen-reader labels (`aria-label`) on all dynamic action controls (Cart additions, toggles, closing modals).
   - High color contrast and focus indicators on keyboard tab triggers.
5. **No Secrets / Safe Deployment**: Cleaned up code to ensure zero secrets like `GEMINI_API_KEY` are shipped.

---

## Local Verification & Development

### Running the App

To open the static shop locally, run any local web server. For example, using Python:
```bash
python3 -m http.server 3000
```
Then visit: `http://localhost:3000`

### Running the Tests

To run the automated Node.js unit tests and verification checks:
```bash
npm test
```
This script executes:
- Unit test suite: `node --test` (asserting logic in `tests/shop.test.js`)
- Static schema audit: `node verify.mjs` (ensuring file structures, route tags, and standards compliance)
