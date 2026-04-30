const API_BASE = "/api";
const CART_KEY = "cart_items";
const WISHLIST_KEY = "wishlist_items";
const ACTIVITY_KEY = "activity_feed";
const THEME_KEY = "theme_preference";

function getAuthToken() {
  return localStorage.getItem("token");
}

function setAuthData(data) {
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

function clearAuthData() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getCurrentUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function setCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  refreshHeaderBadges();
}

function addToCart(product, qty = 1) {
  if (!product) return;
  const current = getCartItems();
  const existing = current.find(item => item._id === product._id);
  if (existing) {
    existing.qty += qty;
  } else {
    current.push({ ...product, qty });
  }
  setCartItems(current);
}

function getWishlistItems() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function toggleWishlist(product) {
  const current = getWishlistItems();
  const exists = current.some(item => item._id === product._id);
  const next = exists ? current.filter(item => item._id !== product._id) : [...current, product];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  refreshHeaderBadges();
  return !exists;
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${isError ? "error" : "success"} show`;
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function handleUnauthorized(message = "Session expired. Please login again.") {
  clearAuthData();
  showToast(message, true);
  setTimeout(() => {
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "/login.html";
    }
  }, 350);
}

function toggleSpinner(show) {
  const spinner = document.getElementById("loading");
  if (!spinner) return;
  spinner.style.display = show ? "flex" : "none";
}

function saveActivity(event) {
  try {
    const feed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    feed.unshift({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...event });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(feed.slice(0, 300)));
  } catch (_error) {
    // no-op: activity should never block UX
  }

  const token = getAuthToken();
  if (!token) return;
  apiRequest(`${API_BASE}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  }).catch(() => undefined);
}

async function getActivityFeed() {
  const token = getAuthToken();
  if (token) {
    try {
      const data = await apiRequest(`${API_BASE}/activity?limit=250`);
      return data.items.map(item => ({
        id: item._id,
        timestamp: item.createdAt,
        action: item.action,
        productId: item.productId,
        productName: item.productName,
        source: item.source,
        metadata: item.metadata || {}
      }));
    } catch (_error) {
      // Fall back to local storage.
    }
  }
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = next === "dark" ? "🌙" : "☀";
  }
}

function getAmazonLink(product) {
  return (
    product?.amazonLink ||
    "https://www.amazon.in/s?k=electronics"
  );
}

function buildCheckoutItems(items) {
  return items
    .map(
      item => `
        <div class="checkout-row">
          <span>${item.name} x${item.qty || 1}</span>
          <strong>$${(item.price * (1 - (item.discount || 0) / 100) * (item.qty || 1)).toFixed(2)}</strong>
        </div>`
    )
    .join("");
}

function openCheckoutModal(items, source = "checkout") {
  return new Promise(resolve => {
    const modal = document.getElementById("checkout-modal");
    const backdrop = document.getElementById("checkout-backdrop");
    const summary = document.getElementById("checkout-summary");
    const redirectText = document.getElementById("checkout-redirect-text");
    const proceedBtn = document.getElementById("checkout-proceed");
    const closeBtn = document.getElementById("checkout-close");
    const tabs = document.querySelectorAll("[data-payment]");

    if (!modal || !backdrop || !summary || !proceedBtn || !closeBtn) {
      resolve(false);
      return;
    }

    const total = items.reduce((sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * (item.qty || 1), 0);
    const target = items[0];
    const savings = target ? (target.price * (target.discount || 0) / 100).toFixed(2) : 0;
    const isHighTrust = target && target.trustScore >= 50;

    const insightHtml = target ? `
      <div style="background:var(--bg-input); padding:12px; border-radius:6px; margin-bottom:16px; border-left:4px solid var(--brand);">
        <h4 style="margin-bottom:8px;">💡 Why buy this?</h4>
        <ul style="margin:0; padding-left:20px; font-size:0.9rem;" class="muted">
          ${target.discount ? `<li>You are saving <strong style="color:#2ecc71;">$${savings}</strong> today!</li>` : ""}
          ${isHighTrust ? `<li><strong>High Trust Score:</strong> Highly rated by the community.</li>` : ""}
          ${target.isBestSeller ? `<li><strong>Best Seller:</strong> Top choice in its category.</li>` : ""}
          ${target.isTrending ? `<li><strong>Trending:</strong> Currently in high demand.</li>` : ""}
          ${!target.discount && !isHighTrust && !target.isBestSeller && !target.isTrending ? `<li>Premium quality guaranteed.</li>` : ""}
        </ul>
      </div>
    ` : "";

    summary.innerHTML = `${insightHtml}${buildCheckoutItems(items)}<div class="checkout-row total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>`;
    redirectText.textContent = "";
    proceedBtn.disabled = false;
    proceedBtn.textContent = "Proceed to Pay";
    modal.classList.add("show");
    backdrop.classList.add("show");

    function close(ok) {
      modal.classList.remove("show");
      backdrop.classList.remove("show");
      proceedBtn.removeEventListener("click", onProceed);
      closeBtn.removeEventListener("click", onClose);
      resolve(ok);
    }

    function onClose() {
      close(false);
    }

    function onProceed() {
      const target = items[0];
      const link = getAmazonLink(target);
      proceedBtn.disabled = true;
      proceedBtn.textContent = "Redirecting...";
      redirectText.textContent = "Redirecting to Amazon in a secure new tab...";
      saveActivity({
        action: "Redirected to Amazon",
        productId: target?._id || "bundle",
        productName: target?.name || "Cart bundle",
        source
      });
      setTimeout(() => {
        window.open(link, "_blank", "noopener,noreferrer");
        close(true);
      }, 700);
    }

    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(other => other.classList.remove("active"));
        tab.classList.add("active");
      };
    });

    closeBtn.addEventListener("click", onClose);
    proceedBtn.addEventListener("click", onProceed);
  });
}

async function apiRequest(url, options = {}) {
  const normalizedOptions = {
    method: options.method || "GET",
    headers: { ...(options.headers || {}) },
    body: options.body,
    credentials: "include"
  };

  // Interceptor-like request phase.
  const token = getAuthToken();
  if (token) {
    normalizedOptions.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, normalizedOptions);

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Interceptor-like response error phase.
    if (
      response.status === 401 &&
      (String(data.message || "").toLowerCase().includes("jwt expired") ||
        String(data.message || "").toLowerCase().includes("invalid token") ||
        String(data.message || "").toLowerCase().includes("unauthorized"))
    ) {
      handleUnauthorized();
    }
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function getRating(product) {
  const seed = String(product._id || product.name || "1")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (3.8 + (seed % 12) / 10).toFixed(1);
}

function renderShell(activePage = "") {
  const root = document.body;
  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  root.classList.add("site-shell");
  setTheme(getTheme());
  root.innerHTML = `
    <header class="top-nav">
      <div class="container nav-inner">
        <a class="brand" href="/index.html"><span>LuxeCart</span></a>
        <nav class="nav-links">
          <a class="${activePage === "home" ? "active" : ""}" href="/index.html">Home</a>
          <a class="${activePage === "products" ? "active" : ""}" href="/products.html">Products</a>
          <a class="${activePage === "activity" ? "active" : ""}" href="/activity.html">Activity</a>
          <a class="${activePage === "profile" ? "active" : ""}" href="/profile.html">Profile</a>
          ${isAdmin ? `<a class="${activePage === "history" ? "active" : ""}" href="/history.html">Admin Logs</a>` : ""}
        </nav>
        <div class="nav-actions">
          <div class="search-wrap">
            <input id="global-search" placeholder="Search products..." />
            <div id="search-suggest" class="search-suggest"></div>
          </div>
          <a href="/wishlist.html" class="icon-btn">❤<span id="wishlist-count" class="chip">0</span></a>
          <a href="/cart.html" class="icon-btn">🛒<span id="cart-count" class="chip">0</span></a>
          <button id="theme-toggle" class="icon-btn" type="button">${getTheme() === "dark" ? "🌙" : "☀"}</button>
          <a href="${user ? "/profile.html" : "/login.html"}" class="icon-btn">${user ? "👤" : "Login"}</a>
        </div>
      </div>
    </header>
    <main class="site-main container" id="app-root"></main>
    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <h4>LuxeCart</h4>
          <p class="muted">Premium ecommerce experience crafted for high conversion and elegant shopping journeys.</p>
        </div>
        <div><h4>Shop</h4><ul><li><a href="/products.html">All Products</a></li><li>Trending</li><li>New Arrivals</li></ul></div>
        <div><h4>Support</h4><ul><li>Contact</li><li>Returns</li><li>Shipping</li></ul></div>
        <div><h4>Legal</h4><ul><li>Privacy Policy</li><li>Terms</li><li>Cookies</li></ul></div>
      </div>
    </footer>
    <div id="loading" class="loading">Loading...</div>
    <div id="toast" class="toast"></div>
    <div id="checkout-backdrop" class="checkout-backdrop"></div>
    <section id="checkout-modal" class="checkout-modal">
      <h3>Secure Checkout Simulation</h3>
      <p class="muted">Complete this premium demo payment flow to continue to Amazon.</p>
      <div class="grid" style="grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <div class="field"><label>Full Name</label><input placeholder="Aarav Kapoor" /></div>
          <div class="field"><label>Address</label><input placeholder="221B, Baker Street" /></div>
          <div class="field"><label>City</label><input placeholder="Bengaluru" /></div>
          <div class="field"><label>ZIP</label><input placeholder="560001" /></div>
        </div>
        <div>
          <div class="payment-tabs">
            <button class="btn btn-secondary active" type="button" data-payment="upi">UPI</button>
            <button class="btn btn-secondary" type="button" data-payment="card">Card</button>
            <button class="btn btn-secondary" type="button" data-payment="nb">Net Banking</button>
          </div>
          <div id="checkout-summary" class="checkout-summary"></div>
        </div>
      </div>
      <p id="checkout-redirect-text" class="muted"></p>
      <div class="actions">
        <button id="checkout-close" type="button" class="btn btn-secondary">Cancel</button>
        <button id="checkout-proceed" type="button">Proceed to Pay</button>
      </div>
    </section>
  `;

  setupGlobalSearch();
  refreshHeaderBadges();
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);
}

function refreshHeaderBadges() {
  const cartCount = document.getElementById("cart-count");
  const wishlistCount = document.getElementById("wishlist-count");
  if (cartCount) {
    const count = getCartItems().reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = String(count);
  }
  if (wishlistCount) {
    wishlistCount.textContent = String(getWishlistItems().length);
  }
}

async function setupGlobalSearch() {
  const input = document.getElementById("global-search");
  const suggestion = document.getElementById("search-suggest");
  if (!input || !suggestion) return;

  let timeoutId;
  input.addEventListener("input", () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const term = input.value.trim();
      if (!term) {
        suggestion.style.display = "none";
        return;
      }
      try {
        const data = await apiRequest(`${API_BASE}/products?search=${encodeURIComponent(term)}&limit=6&page=1`);
        suggestion.innerHTML = data.items
          .map(item => `<button data-id="${item._id}">${item.name}</button>`)
          .join("");
        suggestion.style.display = data.items.length ? "block" : "none";
        suggestion.querySelectorAll("button").forEach(btn => {
          btn.addEventListener("click", () => {
            window.location.href = `/product.html?id=${btn.dataset.id}`;
          });
        });
      } catch (_error) {
        suggestion.style.display = "none";
      }
    }, 180);
  });
}
