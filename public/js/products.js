let page = 1;
let totalPages = 1;
const limit = 8;
let currentProducts = [];
let allProducts = [];
const currentUser = getCurrentUser();
const isAdmin = currentUser?.role === "admin";

function renderPageLayout() {
  renderShell("products");
  const root = document.getElementById("app-root");
  root.innerHTML = `
    ${isAdmin ? `
      <section class="card fade-in" id="admin-form">
        <h2>Admin Product Studio</h2>
        <form id="product-form" class="grid" style="grid-template-columns:repeat(3,1fr);gap:12px;">
          <input type="hidden" id="product-id" />
          <div class="field"><label>Name</label><input id="name" required /></div>
          <div class="field"><label>Category</label><input id="product-category" /></div>
          <div class="field"><label>Price</label><input id="price" type="number" min="0" step="0.01" required /></div>
          <div class="field"><label>Stock</label><input id="stock" type="number" min="0" step="1" required /></div>
          <div class="field"><label>Discount (%)</label><input id="discount" type="number" min="0" max="90" step="1" /></div>
          <div class="field" style="grid-column:span 2;"><label>Image URL</label><input id="imageUrl" /></div>
          <div class="field" style="grid-column:span 2;"><label>Amazon Link</label><input id="amazonLink" /></div>
          <div class="field"><label><input type="checkbox" id="isTrending" /> Trending</label></div>
          <div class="field"><label><input type="checkbox" id="isBestSeller" /> Best Seller</label></div>
          <div class="field" style="grid-column:1/-1;"><label>Description</label><textarea id="description" rows="2"></textarea></div>
          <div class="actions"><button type="submit" id="save-btn">Create Product</button><button type="button" id="cancel-edit-btn" class="btn btn-secondary">Cancel</button></div>
        </form>
      </section>` : ""}
    <section class="layout-with-sidebar">
      <aside class="card sidebar" id="filter-sidebar">
        <h3>Filters</h3>
        <div class="field"><label>Search</label><input id="search" placeholder="name or description" /></div>
        <div class="field"><label>Category</label><select id="category"><option value="">All</option></select></div>
        <div class="field"><label>Min Price</label><input id="min-price" type="number" min="0" /></div>
        <div class="field"><label>Max Price</label><input id="max-price" type="number" min="0" /></div>
        <button id="search-btn">Apply Filters</button>
      </aside>
      <div>
        <button class="btn btn-secondary drawer-toggle" id="open-filters">Filters</button>
        <div class="section-title"><h2>Curated Product Catalog</h2><span class="muted" id="result-count"></span></div>
        <div class="section-title" id="recommended-title" style="display:none;"><h3>✨ Recommended for You</h3></div>
        <div id="recommended-list" class="grid product-grid"></div>
        <div class="section-title"><h3>🔥 Trending Picks</h3></div>
        <div id="trending-list" class="grid product-grid"></div>
        <div class="section-title"><h3>Best Sellers</h3></div>
        <div id="bestseller-list" class="grid product-grid"></div>
        <div class="section-title"><h3>All Products</h3></div>
        <div id="products-list" class="grid product-grid"></div>
        <div class="pager">
          <button id="prev-page" class="btn btn-secondary">Prev</button>
          <span id="pager" class="muted"></span>
          <button id="next-page" class="btn btn-secondary">Next</button>
        </div>
      </div>
    </section>
    <div id="compare-widget" class="card fade-in" style="display:none; position:fixed; bottom:20px; right:20px; z-index:100; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px;">
        <span><strong id="compare-count">0</strong> products selected</span>
        <button id="compare-btn" class="btn">Compare</button>
      </div>
    </div>
  `;
}

let compareList = [];
function updateCompareWidget() {
  const widget = document.getElementById("compare-widget");
  const countSpan = document.getElementById("compare-count");
  if (compareList.length > 0) {
    widget.style.display = "block";
    countSpan.textContent = compareList.length;
  } else {
    widget.style.display = "none";
  }
}

function renderCompareModal() {
  const root = document.getElementById("app-root");
  let modal = document.getElementById("compare-modal-overlay");
  if (modal) modal.remove();
  
  if (compareList.length < 2) {
    showToast("Please select at least 2 products to compare.", true);
    return;
  }
  const items = allProducts.filter(p => compareList.includes(p._id));
  
  const bestMatchId = items.reduce((best, p) => {
    const scoreB = (p.discount || 0) * 1.5 + (p.trustScore || 40);
    const scoreBest = (best.discount || 0) * 1.5 + (best.trustScore || 40);
    return scoreB > scoreBest ? p : best;
  }, items[0])._id;

  modal = document.createElement("div");
  modal.id = "compare-modal-overlay";
  modal.style.position = "fixed";
  modal.style.inset = "0";
  modal.style.background = "rgba(0,0,0,0.8)";
  modal.style.zIndex = "9999";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.padding = "20px";
  
  modal.innerHTML = `
    <div class="card fade-in" style="width:100%; max-width:960px; max-height:92vh; overflow-y:auto; padding:24px; border-radius:20px; border:1px solid var(--stroke);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; border-bottom:1px solid var(--stroke); padding-bottom:16px;">
        <div>
          <h2 style="margin:0; font-family:var(--font-heading);">Comparison Assistant</h2>
          <p class="muted" style="margin:4px 0 0; font-size:0.88rem;">Side-by-side premium specification highlight and value breakdown</p>
        </div>
        <button id="close-compare" class="btn btn-secondary" style="padding:8px 16px;">Close Dialog</button>
      </div>
      <div style="display:grid; grid-template-columns: repeat(${items.length}, 1fr); gap:20px; align-items:stretch;">
        ${items.map(p => {
          const finalPrice = p.price * (1 - (p.discount || 0) / 100);
          const savings = p.price * (p.discount || 0) / 100;
          const isBest = p._id === bestMatchId;
          const ecoVal = p.category === 'Accessories' || p.category === 'Home' ? 'A+' : (p.price > 300 ? 'B' : 'A');
          const needIdx = p.price < 150 ? '85%' : '40%';
          const wantIdx = p.price < 150 ? '15%' : '60%';

          return `
          <div class="card compare-card" style="background:var(--bg-card); padding:20px; border-radius:16px; position:relative; border: ${isBest ? '2px solid var(--brand)' : '1px solid var(--stroke)'}; box-shadow: ${isBest ? '0 10px 30px rgba(99,102,241,0.12)' : 'none'}; display:flex; flex-direction:column; justify-content:space-between; height:100%;">
            ${isBest ? `
              <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:linear-gradient(90deg, var(--brand), var(--brand-2)); color:white; padding:4px 14px; border-radius:99px; font-size:0.7rem; font-weight:800; letter-spacing:0.05em; box-shadow:0 4px 12px rgba(99,102,241,0.25); z-index:10; white-space:nowrap;">
                🏆 BEST VALUE CHOICE
              </div>
            ` : ""}
            <div>
              <div style="position:relative; margin-bottom:14px;">
                <img src="${p.imageUrl || '/logo.svg'}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; border:1px solid var(--stroke);" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
              </div>
              <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span class="pill" style="font-size:0.72rem; padding:4px 10px; background:rgba(99,102,241,0.06);">${p.category}</span>
                <span class="eco-label" style="font-size:0.7rem;">🌿 Eco: ${ecoVal}</span>
              </div>
              <h3 style="margin:0 0 10px; font-size:1.05rem; font-family:var(--font-heading); line-height:1.3; font-weight:700; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; height:44px;" title="${p.name}">${p.name}</h3>
              
              <div style="background:var(--bg-soft); padding:10px 12px; border-radius:12px; margin-bottom:16px; border:1px solid var(--stroke);">
                <div style="font-size:1.35rem; font-weight:800; color:var(--brand-2);">${formatPrice(finalPrice)}</div>
                ${p.discount ? `
                  <div style="font-size:0.78rem; display:flex; justify-content:space-between; margin-top:2px;" class="muted">
                    <span>Original: <s>${formatPrice(p.price)}</s></span>
                    <span style="color:var(--success); font-weight:700;">-${p.discount}% OFF</span>
                  </div>
                ` : `
                  <div style="font-size:0.78rem; margin-top:2px;" class="muted">Standard Price Match</div>
                `}
              </div>

              <!-- Specs Side-by-side checklist -->
              <div style="display:flex; flex-direction:column; gap:10px; font-size:0.8rem; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--stroke);">
                  <span class="muted">Rating & Review:</span>
                  <strong>★ ${getRating(p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--stroke);">
                  <span class="muted">Eco Friendly:</span>
                  <span style="color:var(--success); font-weight:700;">${ecoVal} Grade</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--stroke);">
                  <span class="muted">Need Index:</span>
                  <strong style="color:var(--brand);">${needIdx}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--stroke);">
                  <span class="muted">Availability:</span>
                  <strong style="color:${p.stock > 0 ? 'var(--success)' : 'var(--danger)'};">${p.stock > 0 ? `${p.stock} units` : 'Out of stock'}</strong>
                </div>
              </div>
              
              <p class="muted" style="font-size:0.78rem; line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 16px; height:50px;">
                ${p.description || "No description available."}
              </p>
            </div>
            
            <button class="btn" style="width:100%; padding:10px 14px; font-weight:700; font-size:0.88rem; margin-top:auto;" onclick="addToCartAndClose('${p._id}')">🛒 Add to Cart</button>
          </div>
        `}).join("")}
      </div>
    </div>
  `;
  root.appendChild(modal);
  document.getElementById("close-compare").addEventListener("click", () => modal.remove());
}

window.addToCartAndClose = function(id) {
  const p = allProducts.find(x => x._id === id);
  if(p) {
    addToCart(p, 1);
    showToast("Added to cart");
    document.getElementById("compare-modal-overlay")?.remove();
  }
};

function getProductPayload() {
  return {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("product-category").value.trim() || "General",
    price: Number(document.getElementById("price").value),
    stock: Number(document.getElementById("stock").value),
    discount: Number(document.getElementById("discount").value || 0),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    amazonLink: document.getElementById("amazonLink").value.trim(),
    isTrending: document.getElementById("isTrending").checked,
    isBestSeller: document.getElementById("isBestSeller").checked
  };
}

function resetProductForm() {
  document.getElementById("product-id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  document.getElementById("product-category").value = "";
  document.getElementById("price").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("discount").value = "";
  document.getElementById("imageUrl").value = "";
  document.getElementById("amazonLink").value = "";
  document.getElementById("isTrending").checked = false;
  document.getElementById("isBestSeller").checked = false;
  document.getElementById("save-btn").textContent = "Create Product";
}

function applyClientFilters(items) {
  const minPrice = Number(document.getElementById("min-price").value || 0);
  const maxInput = document.getElementById("max-price").value;
  const maxPrice = maxInput ? Number(maxInput) : Number.POSITIVE_INFINITY;
  return items.filter(item => item.price >= minPrice && item.price <= maxPrice);
}

function renderProducts(items) {
  const list = document.getElementById("products-list");
  if (!items.length) {
    list.innerHTML = `<div class="card"><h3>No products found</h3><p class="muted">Try adjusting your search or filters.</p></div>`;
    return;
  }

  list.innerHTML = items
    .map(product => {
      const finalPrice = product.price * (1 - (product.discount || 0) / 100);
      const isPopular = product.isTrending || product.isBestSeller;
      const isLimited = product.stock > 0 && product.stock < 20;
      const inWishlist = getWishlistItems().some(item => item._id === product._id);

      return `
      <article class="product-card fade-in">
        <!-- Glassmorphic Image Wrapper with Floating Overlays -->
        <div class="product-card-image-wrap">
          <img class="product-thumb" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
          
          <!-- Badges Overlay -->
          <div class="image-overlay-badge-container">
            ${product.discount ? `<span class="image-overlay-badge discount">-${product.discount}% OFF</span>` : ""}
            ${isLimited ? `<span class="image-overlay-badge" style="background:#e67e22;">⏳ Low Stock</span>` : ""}
            ${isPopular && !isLimited ? `<span class="image-overlay-badge" style="background:#f39c12; color:#000;">🔥 Popular</span>` : ""}
          </div>
          
          <!-- Glassmorphic Quick View Hover Overlay -->
          <div class="quick-view-overlay">
            <button class="btn quick-view-btn-glass" data-quick="${product._id}">Quick View</button>
          </div>
          
          <!-- Floating Wishlist Heart Icon -->
          <button class="wishlist-overlay-btn" data-wish="${product._id}" title="${inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}" onclick="event.stopPropagation();">
            ${inWishlist ? "❤️" : "🤍"}
          </button>
          
          <!-- Floating Compare Checkbox Overlay -->
          <label class="compare-overlay-label" onclick="event.stopPropagation();">
            <input type="checkbox" class="compare-cb" data-id="${product._id}" ${compareList.includes(product._id) ? "checked" : ""}>
            <span>Compare</span>
          </label>
          
          <!-- Admin Tools Overlay Toolbar (displayed on card hover) -->
          ${isAdmin ? `
            <div class="admin-hover-toolbar">
              <button class="btn btn-secondary" data-edit="${product._id}">Edit</button>
              <button class="btn btn-danger" data-delete="${product._id}">Delete</button>
            </div>
          ` : ""}
        </div>

        <div class="product-meta" style="margin-top: 12px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
          <div>
            <!-- Category Pill -->
            <span class="pill" style="font-size: 0.65rem; padding: 2px 8px; margin-bottom: 6px;">${product.category || "General"}</span>
            
            <!-- Clean Minimal Product Title -->
            <h3 style="margin: 4px 0 0; font-size: 0.98rem; min-height: 40px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${product.name}">${product.name}</h3>
          </div>

          <div style="margin-top: 10px;">
            <!-- Clean Price and Rating Row -->
            <div class="price-line" style="margin-bottom: 12px; align-items: baseline;">
              <span class="price" style="font-size: 1.18rem; font-weight: 800; color: var(--brand-2);">${formatPrice(finalPrice)}</span>
              <span class="rating" style="font-size: 0.85rem;">★ ${getRating(product)}</span>
            </div>

            <!-- Quick Add to Cart Action -->
            <button class="btn" data-cart="${product._id}" style="width: 100%; justify-content: center; font-weight: 700; margin-top: auto; padding: 10px 0;">🛒 Add to Cart</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  list.querySelectorAll(".compare-cb").forEach(cb => {
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (compareList.length >= 3) {
          e.target.checked = false;
          showToast("You can compare up to 3 products at a time.", true);
          return;
        }
        compareList.push(e.target.dataset.id);
      } else {
        compareList = compareList.filter(id => id !== e.target.dataset.id);
      }
      updateCompareWidget();
    });
  });

  list.querySelectorAll("[data-cart]").forEach(button => {
    button.addEventListener("click", () => {
      const product = currentProducts.find(item => item._id === button.dataset.cart);
      addToCart(product, 1);
      saveActivity({ action: "Added to cart", productId: product._id, productName: product.name, source: "products" });
      showToast("Added to cart");
      openCheckoutModal([product], "products-add-to-cart");
    });
  });
  list.querySelectorAll("[data-buy]").forEach(button => {
    button.addEventListener("click", () => {
      const product = currentProducts.find(item => item._id === button.dataset.buy);
      if (!product) return;
      saveActivity({ action: "Redirected to Amazon", productId: product._id, productName: product.name, source: "products-buy-now" });
      showToast("Redirecting to Amazon...");
      window.open(product.amazonLink || "https://www.amazon.com", "_blank");
    });
  });

  list.querySelectorAll("[data-wish]").forEach(button => {
    button.addEventListener("click", () => {
      const product = currentProducts.find(item => item._id === button.dataset.wish);
      const added = toggleWishlist(product);
      saveActivity({
        action: added ? "Added to wishlist" : "Removed from wishlist",
        productId: product._id,
        productName: product.name,
        source: "products"
      });
      showToast(added ? "Added to wishlist" : "Removed from wishlist");
    });
  });

  list.querySelectorAll("[data-quick]").forEach(button => {
    button.addEventListener("click", () => {
      const product = currentProducts.find(item => item._id === button.dataset.quick);
      if (!product) return;
      saveActivity({ action: "Product viewed", productId: product._id, productName: product.name, source: "quick-view" });
      rootQuickView(product);
    });
  });

  if (isAdmin) {
    list.querySelectorAll("[data-edit]").forEach(button => {
      button.addEventListener("click", () => {
        const product = currentProducts.find(item => item._id === button.dataset.edit);
        if (!product) return;
        document.getElementById("product-id").value = product._id;
        document.getElementById("name").value = product.name || "";
        document.getElementById("description").value = product.description || "";
        document.getElementById("product-category").value = product.category || "";
        document.getElementById("price").value = product.price ?? 0;
        document.getElementById("stock").value = product.stock ?? 0;
        document.getElementById("discount").value = product.discount ?? 0;
        document.getElementById("imageUrl").value = product.imageUrl || "";
        document.getElementById("amazonLink").value = product.amazonLink || "";
        document.getElementById("isTrending").checked = Boolean(product.isTrending);
        document.getElementById("isBestSeller").checked = Boolean(product.isBestSeller);
        document.getElementById("save-btn").textContent = "Update Product";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    list.querySelectorAll("[data-delete]").forEach(button => {
      button.addEventListener("click", async () => {
        showDeleteModal(async () => {
          try {
            const deleteId = button.dataset.delete;
            await apiRequest(`${API_BASE}/products/${deleteId}`, { method: "DELETE" });
            currentProducts = currentProducts.filter(item => item._id !== deleteId);
            allProducts = allProducts.filter(item => item._id !== deleteId);
            renderProducts(currentProducts);
            renderTopSections(allProducts);
            document.getElementById("result-count").textContent = `${Math.max(0, Number(document.getElementById("result-count").textContent.split(" ")[0] || allProducts.length) - 1)} products available`;
            showToast("Product deleted");
          } catch (error) {
            showToast(error.message, true);
          }
        });
      });
    });
  }
}

function rootQuickView(product) {
  const root = document.getElementById("app-root");
  const old = document.getElementById("quick-view-card");
  if (old) old.remove();
  const el = document.createElement("section");
  el.id = "quick-view-card";
  el.className = "card fade-in";
  el.innerHTML = `
    <div class="price-line"><h3 style="margin:0;">Quick View</h3><button id="quick-close" class="btn btn-secondary">Close</button></div>
    <div class="product-detail">
      <img class="gallery-main" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" />
      <div>
        <span class="pill">${product.category || "General"}</span>
        <h2>${product.name}</h2>
        <p class="muted">${product.description || ""}</p>
        <p class="price">${formatPrice(product.price * (1 - (product.discount || 0) / 100))}</p>
        <div class="actions">
          <a class="btn btn-secondary" href="/product.html?id=${product._id}">Open Details</a>
          <button id="quick-buy">Buy Now</button>
        </div>
      </div>
    </div>
  `;
  root.prepend(el);
  document.getElementById("quick-close").addEventListener("click", () => el.remove());
  document.getElementById("quick-buy").addEventListener("click", () => {
    openCheckoutModal([product], "quick-view-buy");
  });
}

function showDeleteModal(onConfirm) {
  const root = document.getElementById("app-root");
  const old = document.getElementById("delete-modal");
  if (old) old.remove();
  const el = document.createElement("section");
  el.id = "delete-modal";
  el.className = "card fade-in";
  el.style.position = "fixed";
  el.style.top = "50%";
  el.style.left = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.zIndex = "9999";
  el.style.boxShadow = "0 10px 40px rgba(0,0,0,0.5)";
  el.innerHTML = `
    <h3>Confirm Deletion</h3>
    <p class="muted">Are you sure you want to permanently delete this product? This action cannot be undone.</p>
    <div class="actions" style="margin-top: 20px;">
      <button id="cancel-delete" class="btn btn-secondary">Cancel</button>
      <button id="confirm-delete" class="btn btn-danger" style="background: #e74c3c; border-color: #e74c3c;">Yes, Delete</button>
    </div>
  `;
  root.appendChild(el);
  
  document.getElementById("cancel-delete").addEventListener("click", () => el.remove());
  document.getElementById("confirm-delete").addEventListener("click", () => {
    el.remove();
    onConfirm();
  });
}

function renderTopSections(items) {
  const trendingList = document.getElementById("trending-list");
  const bestSellerList = document.getElementById("bestseller-list");
  const renderCard = product => {
    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
    return `
      <article class="product-card">
        <img class="product-thumb" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
        <div class="product-meta">
          <h4>${product.name}</h4>
          <div class="price-line"><span class="price">${formatPrice(finalPrice)}</span><button class="btn btn-secondary" data-quick="${product._id}">Quick View</button></div>
        </div>
      </article>`;
  };
  trendingList.innerHTML = items.filter(item => item.isTrending).slice(0, 4).map(renderCard).join("") || `<div class="muted">No trending items</div>`;
  bestSellerList.innerHTML = items.filter(item => item.isBestSeller).slice(0, 4).map(renderCard).join("") || `<div class="muted">No best sellers</div>`;
}

function renderRecommendedSection(items) {
  const list = document.getElementById("recommended-list");
  const title = document.getElementById("recommended-title");
  if (!items || items.length === 0) {
    title.style.display = "none";
    list.innerHTML = "";
    return;
  }
  
  title.style.display = "block";
  const renderCard = product => {
    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
    return `
      <article class="product-card" style="border-color:var(--brand); box-shadow:0 4px 12px rgba(99,102,241,0.2);">
        <img class="product-thumb" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
        <div class="product-meta">
          <span class="badge" style="background:var(--brand); color:#fff; position:absolute; top:10px; right:10px;">⭐ For You</span>
          <h4>${product.name}</h4>
          <div class="price-line"><span class="price">${formatPrice(finalPrice)}</span><button class="btn btn-secondary" data-quick="${product._id}">Quick View</button></div>
        </div>
      </article>`;
  };
  list.innerHTML = items.map(renderCard).join("");
  
  list.querySelectorAll("[data-quick]").forEach(button => {
    button.addEventListener("click", () => {
      const product = items.find(item => item._id === button.dataset.quick);
      if (!product) return;
      saveActivity({ action: "Product viewed", productId: product._id, productName: product.name, source: "recommended" });
      rootQuickView(product);
    });
  });
}

function fillCategoryOptions(items) {
  const select = document.getElementById("category");
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))].sort();
  const selected = select.value;
  select.innerHTML = `<option value="">All</option>${categories.map(cat => `<option value="${cat}">${cat}</option>`).join("")}`;
  select.value = selected || "";
}

async function loadProducts() {
  const list = document.getElementById("products-list");
  list.innerHTML = new Array(8).fill('<div class="skeleton"></div>').join("");
  const search = document.getElementById("search").value.trim();
  const category = document.getElementById("category").value.trim();
  try {
    const query = new URLSearchParams({ page, limit, search, category });
    const data = await apiRequest(`${API_BASE}/products?${query.toString()}`);
    currentProducts = applyClientFilters(data.items);
    allProducts = data.items;
    totalPages = data.pagination.pages || 1;
    document.getElementById("pager").textContent = `Page ${data.pagination.page} of ${totalPages}`;
    document.getElementById("result-count").textContent = `${data.pagination.total} products available`;
    fillCategoryOptions(data.items);
    renderTopSections(data.items);
    renderProducts(currentProducts);
    
    // Fetch recommendations
    try {
      const recData = await apiRequest(`${API_BASE}/recommendations?limit=4`);
      renderRecommendedSection(recData.items);
      // Merge recommended into allProducts so quickview works properly
      recData.items.forEach(rec => {
        if (!allProducts.find(p => p._id === rec._id)) allProducts.push(rec);
      });
    } catch (e) {
      console.warn("Failed to load recommendations:", e);
    }

    document.querySelectorAll("#trending-list [data-quick], #bestseller-list [data-quick]").forEach(button => {
      button.addEventListener("click", () => {
        const product = data.items.find(item => item._id === button.dataset.quick);
        if (!product) return;
        saveActivity({ action: "Product viewed", productId: product._id, productName: product.name, source: "products-top" });
        rootQuickView(product);
      });
    });
  } catch (error) {
    list.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
  }
}

async function saveProduct(event) {
  event.preventDefault();
  const productId = document.getElementById("product-id").value;
  const payload = getProductPayload();
  if (!payload.name || payload.price <= 0 || payload.stock < 0) {
    showToast("Please provide valid values (price > 0, stock >= 0).", true);
    return;
  }
  try {
    if (productId) {
      const updated = await apiRequest(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      currentProducts = currentProducts.map(item => (item._id === updated._id ? updated : item));
      allProducts = allProducts.map(item => (item._id === updated._id ? updated : item));
      renderProducts(currentProducts);
      renderTopSections(allProducts);
      showToast("Product updated");
    } else {
      const created = await apiRequest(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      currentProducts = [created, ...currentProducts];
      allProducts = [created, ...allProducts];
      renderProducts(currentProducts);
      renderTopSections(allProducts);
      document.getElementById("result-count").textContent = `${allProducts.length} products available`;
      showToast("Product created");
    }
    resetProductForm();
  } catch (error) {
    showToast(error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderPageLayout();
  if (isAdmin) {
    document.getElementById("product-form").addEventListener("submit", saveProduct);
    document.getElementById("cancel-edit-btn").addEventListener("click", resetProductForm);
  }
  document.getElementById("search-btn").addEventListener("click", () => {
    page = 1;
    loadProducts();
  });
  document.getElementById("open-filters").addEventListener("click", () => {
    document.getElementById("filter-sidebar").classList.toggle("open");
  });
  document.getElementById("next-page").addEventListener("click", () => {
    page = Math.min(totalPages, page + 1);
    loadProducts();
  });
  document.getElementById("prev-page").addEventListener("click", () => {
    page = Math.max(1, page - 1);
    loadProducts();
  });
  
  // Attach event listener for Compare button in widget
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "compare-btn") {
      renderCompareModal();
    }
  });

  loadProducts();
});
