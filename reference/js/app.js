import { resolveRoute, formatPrice, inStock, summarize } from "./shop.js";

// --- State Management ---
let products = [];
let cart = [];
let currentSelectedProductId = null;

// --- DOM Selectors ---
const storeStatsContainer = document.getElementById("store-stats");
const productsListContainer = document.getElementById("products-list-container");
const navShop = document.getElementById("nav-shop");
const navAbout = document.getElementById("nav-about");
const sections = document.querySelectorAll(".view-section");

// Cart DOM Selectors
const cartBtn = document.getElementById("cart-btn");
const cartCloseBtn = document.getElementById("cart-close-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartBackdrop = document.getElementById("cart-backdrop");
const cartCount = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotalPrice = document.getElementById("cart-total-price");
const giftWrappingCheckbox = document.getElementById("gift-wrapping");
const checkoutBtn = document.getElementById("checkout-btn");

// Modal DOM Selectors
const productDetailModal = document.getElementById("product-detail-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalContentContainer = document.getElementById("modal-content-container");

// Toast Selector
const toastMessage = document.getElementById("toast-message");

// --- Router ---
function router() {
  const hash = window.location.hash;
  const viewId = resolveRoute(hash);

  // Update active view sections
  sections.forEach((section) => {
    if (section.id === viewId) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  // Handle route nav highlights
  if (viewId === "shop") {
    navShop.classList.add("active");
    navAbout.classList.remove("active");
  } else if (viewId === "about") {
    navShop.classList.remove("active");
    navAbout.classList.add("active");
  } else {
    navShop.classList.remove("active");
    navAbout.classList.remove("active");
  }
}

// --- Local Storage Cart Handlers ---
function saveCart() {
  localStorage.setItem("sora_stationery_cart_v2", JSON.stringify(cart));
  renderCart();
}

function loadCart() {
  const saved = localStorage.getItem("sora_stationery_cart_v2");
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }
  renderCart();
}

// --- Render Statistics ---
function renderStats() {
  const stats = summarize(products);
  storeStatsContainer.innerHTML = `
    <span class="summary-item" aria-label="Total catalog items"><span class="summary-dot dot-total"></span>Total: ${stats.count}</span>
    <span class="summary-item" aria-label="Available items in stock"><span class="summary-dot dot-instock"></span>In Stock: ${stats.inStock}</span>
    <span class="summary-item" aria-label="Sold out items"><span class="summary-dot dot-soldout"></span>Sold Out: ${stats.soldOut}</span>
  `;
}

// --- Render Products Catalog ---
function renderCatalog() {
  productsListContainer.innerHTML = "";
  
  products.forEach((product) => {
    const isOut = product.stock === 0;
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details of ${product.name}`);
    
    card.innerHTML = `
      <div class="product-emoji-container">
        ${isOut ? '<span class="product-badge">Sold Out</span>' : ""}
        <span>${product.emoji}</span>
      </div>
      <div class="product-details">
        <h2 class="product-name">${product.name}</h2>
        <p class="product-price">${formatPrice(product.price)}</p>
        <p class="product-stock-status">
          ${isOut ? '<span class="status-out">Out of Stock</span>' : `<span class="status-in">In Stock (${product.stock})</span>`}
        </p>
        <button class="add-to-cart-btn" 
                data-id="${product.id}" 
                ${isOut ? "disabled" : ""} 
                aria-label="Add ${product.name} to Kyoto parcel">
          ${isOut ? "Sold Out" : "Add to Parcel"}
        </button>
      </div>
    `;

    // Clicking card opens modal (unless clicking the add-to-cart button directly)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart-btn")) {
        return;
      }
      openModal(product.id);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(product.id);
      }
    });

    productsListContainer.appendChild(card);
  });

  // Bind add-to-cart buttons
  document.querySelectorAll(".product-card .add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.target.getAttribute("data-id");
      addToCart(productId);
    });
  });
}

// --- Modal Detail Handlers ---
function openModal(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  currentSelectedProductId = productId;
  const isOut = product.stock === 0;
  
  // Find current in-cart count to check limits
  const cartItem = cart.find((item) => item.productId === productId);
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const maxAvailableToAdd = product.stock - currentInCart;

  modalContentContainer.innerHTML = `
    <div class="modal-header-art">
      <span>${product.emoji}</span>
    </div>
    <h2 class="modal-product-title" id="modal-title">${product.name}</h2>
    <p class="modal-price">${formatPrice(product.price)}</p>
    <p class="modal-description">${product.alt}</p>
    <div class="modal-actions">
      ${
        isOut
          ? '<span class="status-out">Currently out of stock. Join our Kyoto guestlist for next release alerts! 🕊️</span>'
          : `
          <div class="qty-input-container">
            <button class="qty-btn" id="modal-dec-btn" aria-label="Decrease quantity">-</button>
            <span class="qty-display" id="modal-qty">1</span>
            <button class="qty-btn" id="modal-inc-btn" aria-label="Increase quantity">+</button>
          </div>
          <button class="add-to-cart-btn" id="modal-add-btn" aria-label="Add selected quantity of ${product.name} to parcel">
            Add to Parcel
          </button>
          `
      }
    </div>
  `;

  productDetailModal.showModal();
  
  // Bind modal quantity buttons
  if (!isOut) {
    const modalDecBtn = document.getElementById("modal-dec-btn");
    const modalIncBtn = document.getElementById("modal-inc-btn");
    const modalQtySpan = document.getElementById("modal-qty");
    const modalAddBtn = document.getElementById("modal-add-btn");
    
    let selectedQty = 1;

    modalDecBtn.addEventListener("click", () => {
      if (selectedQty > 1) {
        selectedQty--;
        modalQtySpan.textContent = selectedQty;
      }
    });

    modalIncBtn.addEventListener("click", () => {
      if (selectedQty < maxAvailableToAdd) {
        selectedQty++;
        modalQtySpan.textContent = selectedQty;
      } else {
        showToast("Maximum available stock reached!");
      }
    });

    modalAddBtn.addEventListener("click", () => {
      if (selectedQty > 0) {
        addToCart(productId, selectedQty);
        productDetailModal.close();
      }
    });
  }
}

// Close Modal
closeModalBtn.addEventListener("click", () => {
  productDetailModal.close();
});

// --- Cart Core Handlers ---
function addToCart(productId, quantity = 1) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex((item) => item.productId === productId);
  
  if (existingIndex > -1) {
    const currentQty = cart[existingIndex].quantity;
    const newQty = Math.min(currentQty + quantity, product.stock);
    cart[existingIndex].quantity = newQty;
    
    if (currentQty + quantity > product.stock) {
      showToast(`Adjusted to maximum available stock of ${product.stock} items!`);
    } else {
      showToast(`Updated ${product.name} quantity in your Kyoto parcel! ✨`);
    }
  } else {
    cart.push({ productId, quantity });
    showToast(`Added ${product.name} to your Kyoto parcel! 🍃`);
  }

  saveCart();
}

function updateCartItemQuantity(productId, quantity) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const itemIndex = cart.findIndex((item) => item.productId === productId);
  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast(`Removed ${product.name} from your Kyoto parcel.`);
    } else {
      cart[itemIndex].quantity = Math.min(quantity, product.stock);
    }
    saveCart();
  }
}

function renderCart() {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="cart-empty-message">Your Kyoto parcel is currently empty.<br>Browse our virtual archive to fill it! 🌙</p>`;
    cartTotalPrice.textContent = formatPrice(0);
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  cartItemsList.innerHTML = "";
  
  let totalPriceCents = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const itemCost = product.price * item.quantity;
    totalPriceCents += itemCost;

    const cartItemDiv = document.createElement("div");
    cartItemDiv.className = "cart-item";
    cartItemDiv.innerHTML = `
      <div class="cart-item-art">${product.emoji}</div>
      <div class="cart-item-details">
        <span class="cart-item-name">${product.name}</span>
        <span class="cart-item-price">${formatPrice(product.price)}</span>
        <div class="cart-item-controls">
          <div class="qty-input-container">
            <button class="qty-btn dec-cart-qty" data-id="${product.id}" aria-label="Decrease quantity of ${product.name}">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn inc-cart-qty" data-id="${product.id}" aria-label="Increase quantity of ${product.name}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
        </div>
      </div>
    `;

    cartItemsList.appendChild(cartItemDiv);
  });

  // Calculate gift wrapping fee
  if (giftWrappingCheckbox.checked) {
    totalPriceCents += 300; // $3.00 in cents
  }

  cartTotalPrice.textContent = formatPrice(totalPriceCents);

  // Bind dynamic quantity actions inside cart
  document.querySelectorAll(".dec-cart-qty").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const current = cart.find((item) => item.productId === id);
      if (current) updateCartItemQuantity(id, current.quantity - 1);
    });
  });

  document.querySelectorAll(".inc-cart-qty").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const current = cart.find((item) => item.productId === id);
      const product = products.find((p) => p.id === id);
      if (current && product) {
        if (current.quantity < product.stock) {
          updateCartItemQuantity(id, current.quantity + 1);
        } else {
          showToast("Maximum available stock reached!");
        }
      }
    });
  });

  document.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      updateCartItemQuantity(id, 0);
    });
  });
}

// --- Cart Drawer Toggles ---
function openCart() {
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

cartBtn.addEventListener("click", openCart);
cartCloseBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

// Gift wrapping update recalculates subtotal
giftWrappingCheckbox.addEventListener("change", () => {
  renderCart();
});

// --- Checkout Handler ---
checkoutBtn.addEventListener("click", () => {
  showToast("🍃 Order received! Our Kyoto artisans are hand-wrapping your parcel now... 🕊️");
  cart = [];
  giftWrappingCheckbox.checked = false;
  saveCart();
  closeCart();
});

// --- Toast Feedback ---
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toastMessage.textContent = message;
  toastMessage.classList.add("show");
  toastTimeout = setTimeout(() => {
    toastMessage.classList.remove("show");
  }, 4000);
}

// --- Initialization ---
async function init() {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Could not fetch stationery products.");
    
    const data = await response.json();
    products = data.products || [];
    
    renderStats();
    renderCatalog();
    loadCart();
  } catch (error) {
    console.error("App startup failure:", error);
    storeStatsContainer.innerHTML = `<span style="color: #c9302c">Failed to open the sanctuary archive. Please try refreshing.</span>`;
  }
}

// Router Event Listeners
window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
  router();
  init();
});
