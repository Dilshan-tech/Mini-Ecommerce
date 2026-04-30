document.addEventListener("DOMContentLoaded", async () => {
  renderShell("products");
  const root = document.getElementById("app-root");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    root.innerHTML = `<div class="card"><h2>Product not found</h2></div>`;
    return;
  }

  root.innerHTML = `<div class="card"><div class="skeleton" style="height:420px;"></div></div>`;
  try {
    const product = await apiRequest(`${API_BASE}/products/${id}`);
    saveActivity({ action: "Product viewed", productId: product._id, productName: product.name, source: "product-page" });
    const related = await apiRequest(`${API_BASE}/products?category=${encodeURIComponent(product.category)}&limit=6&page=1`);
    const images = [product.imageUrl || "/logo.svg", product.imageUrl || "/logo.svg", product.imageUrl || "/logo.svg"];

    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
    const savings = product.price * (product.discount || 0) / 100;
    const isHighTrust = product.trustScore >= 50;
    const isPopular = product.isTrending || product.isBestSeller;
    const isLimited = product.stock > 0 && product.stock < 20;

    root.innerHTML = `
      <section class="product-detail">
        <article class="card">
          <img id="main-image" class="gallery-main" loading="lazy" decoding="async" src="${images[0]}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
          <div class="thumb-row">
            ${images.map(src => `<img loading="lazy" decoding="async" src="${src}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />`).join("")}
          </div>
        </article>
        <article class="card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span class="pill">${product.category}</span>
            <div class="badge-row">
              ${product.discount ? `<span class="badge" style="background:#e74c3c;">-${product.discount}% OFF</span>` : ""}
              ${isHighTrust ? `<span class="badge" style="background:#2ecc71; color:#000;">🛡️ High Trust</span>` : ""}
              ${isPopular && !isHighTrust ? `<span class="badge" style="background:#f39c12; color:#000;">🔥 Popular</span>` : ""}
              ${isLimited ? `<span class="badge" style="background:#e67e22; color:#fff;">⏳ Limited Stock</span>` : ""}
            </div>
          </div>
          <h1 style="margin-top:12px;">${product.name}</h1>
          <p class="muted">${product.description || "No description provided."}</p>
          
          <div style="background:var(--bg-input); padding:12px; border-radius:6px; margin:16px 0;">
            <div class="price-line" style="margin-bottom:0;">
              <span class="price" style="font-size:2rem;">$${finalPrice.toFixed(2)}</span>
              <span class="rating">★ ${getRating(product)} · ${Math.max(6, Number(product.stock || 0))} reviews</span>
            </div>
            ${product.discount ? `
              <div style="display:flex; justify-content:space-between; font-size:1rem; margin-top:8px;">
                <span class="muted">Original Price: <s>$${product.price.toFixed(2)}</s></span>
                <span style="color:#2ecc71; font-weight:bold;">You Save: $${savings.toFixed(2)}</span>
              </div>
            ` : ""}
          </div>
          <p class="${product.stock > 0 ? "muted" : "status-delete"}">${product.stock > 0 ? "In stock - ready to ship" : "Out of stock"}</p>
          <div class="actions" style="margin-top:16px;">
            <button id="add-cart">Add to Cart</button>
            <button id="buy-now" class="btn btn-secondary">Buy Now</button>
          </div>
        </article>
      </section>
      <section class="section-title"><h2>Related Products</h2></section>
      <section class="grid product-grid">
        ${related.items
          .filter(item => item._id !== product._id)
          .slice(0, 4)
          .map(
            item => `<article class="product-card">
              <img class="product-thumb" loading="lazy" decoding="async" src="${item.imageUrl || "/logo.svg"}" alt="${item.name}" />
              <div class="product-meta">
                <h3>${item.name}</h3>
                <div class="price-line"><span class="price">$${item.price}</span><a class="btn btn-secondary" href="/product.html?id=${item._id}">View</a></div>
              </div>
            </article>`
          )
          .join("")}
      </section>
    `;

    document.querySelectorAll(".thumb-row img").forEach(thumb => {
      thumb.addEventListener("click", () => {
        document.getElementById("main-image").src = thumb.src;
      });
    });

    document.getElementById("add-cart").addEventListener("click", () => {
      addToCart(product, 1);
      saveActivity({ action: "Added to cart", productId: product._id, productName: product.name, source: "product-page" });
      showToast("Added to cart");
      openCheckoutModal([product], "product-add-to-cart");
    });

    document.getElementById("buy-now").addEventListener("click", () => {
      saveActivity({ action: "Checkout initiated", productId: product._id, productName: product.name, source: "buy-now" });
      showToast("Redirecting to Amazon...");
      openCheckoutModal([product], "buy-now");
    });
  } catch (error) {
    root.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
  }
});
