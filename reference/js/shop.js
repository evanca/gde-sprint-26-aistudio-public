export const ROUTES = ["shop", "about"];

export function resolveRoute(hash) {
  if (!hash || hash === "#/" || hash === "#") {
    return "shop";
  }
  if (hash === "#/shop") {
    return "shop";
  }
  if (hash === "#/about") {
    return "about";
  }
  return "404";
}

export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function inStock(products) {
  return products.filter((p) => p.stock > 0);
}

export function summarize(products) {
  const count = products.length;
  const soldOut = products.filter((p) => p.stock === 0).length;
  const inStockCount = count - soldOut;
  return {
    count,
    soldOut,
    inStock: inStockCount,
  };
}
