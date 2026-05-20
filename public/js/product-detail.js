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

    const ecoVal = product.category === 'Accessories' || product.category === 'Home' ? 'A+' : (product.price > 300 ? 'B' : 'A');
    const needIndexVal = product.price < 150 ? '85%' : '40%';
    const wantIndexVal = product.price < 150 ? '15%' : '60%';
    const storyText = product.category === "Electronics"
      ? "An investment in top-tier performance to streamline your productivity."
      : product.category === "Accessories"
      ? "Meticulously crafted detailing that adds effortless style to your daily carry."
      : "Consciously curated to bring lasting value and comfort into your life.";

    root.innerHTML = `
      <section class="detail-grid-container">
        <!-- Left Side: Product Gallery Panel -->
        <article class="detail-gallery-card">
          <div class="card" style="padding: 16px; border-radius: 20px; overflow: hidden;">
            <img id="main-image" class="gallery-main" loading="lazy" decoding="async" src="${images[0]}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" style="border-radius:16px; border:1px solid var(--stroke);" />
            <div class="thumb-row" style="margin-top:16px;">
              ${images.map(src => `<img loading="lazy" decoding="async" src="${src}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" style="border-radius:8px; border:1px solid var(--stroke);" />`).join("")}
            </div>
          </div>
        </article>

        <!-- Right Side: Structured Details Panel -->
        <article class="detail-glass-card">
          <!-- 1. Header Details Section -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span class="pill" style="font-weight:700; font-size:0.75rem; padding:4px 12px; background:rgba(99, 102, 241, 0.08);">${product.category}</span>
              <p class="${product.stock > 0 ? "muted" : "status-delete"}" style="font-size:0.82rem; font-weight:700; margin:0; display:flex; align-items:center; gap:6px;">
                ${product.stock > 0 ? '🟢 In stock · ready to ship' : '🔴 Out of stock'}
              </p>
            </div>
            <h1 style="margin: 16px 0 8px; font-family:var(--font-heading); line-height:1.2; font-size:2.2rem; font-weight:800; letter-spacing:-0.5px;">${product.name}</h1>
            <p class="muted" style="line-height:1.6; font-size:0.95rem; margin:0;">${product.description || "No description provided."}</p>
          </div>

          <!-- 2. Premium Sustainable Design Note -->
          <div class="detail-story-card">
            <strong>✨ Mindful Design Note:</strong> ${storyText}
          </div>

          <!-- 3. High-Contrast Pricing & Savings Card -->
          <div class="detail-premium-price-box">
            <div class="price-line" style="margin-bottom:0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <span class="price" style="font-size:2.3rem; font-weight:800; color:var(--brand-2);">${formatPrice(finalPrice)}</span>
              <span class="rating" style="font-size:0.92rem; font-weight:700;">★ ${getRating(product)} · ${Math.max(6, Number(product.stock || 0) + 4)} reviews</span>
            </div>
            ${product.discount ? `
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px;" class="muted">
                <span>Original Price: <s>${formatPrice(product.price)}</s></span>
                <span style="color:#2ecc71; font-weight:bold;">Launch Discount Savings: ${formatPrice(savings)}</span>
              </div>
            ` : ""}
          </div>
          
          <!-- 4. Need vs Want Progress Slider Card -->
          <div class="detail-slider-card">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700;" class="muted">
              <span>Need index: ${needIndexVal} (Utility)</span>
              <span>Want index: ${wantIndexVal} (Impulse)</span>
            </div>
            <div class="need-bar" style="margin-top:8px; height:6px; background:rgba(255,255,255,0.06);">
              <div class="need-bar-fill" style="width: ${needIndexVal};"></div>
            </div>
            <p class="muted" style="font-size:0.7rem; margin:8px 0 0; line-height:1.4;">LuxeCart optimization solver computes utility index based on category requirements, price, and carbon profile metrics.</p>
          </div>

          <!-- 5. Climate Certified Compliance Box -->
          <div class="detail-eco-box">
            <span class="eco-label" style="font-size:0.85rem; padding:6px 14px;">🌿 Eco Rating: ${ecoVal}</span>
            <span class="muted" style="font-size:0.78rem; line-height:1.4;">Certified carbon-neutral supply chain & 100% biodegradable custom express delivery compliance.</span>
          </div>

          <!-- 6. Call To Actions Area -->
          <div class="actions" style="margin-top:8px; gap:16px;">
            <button id="add-cart" class="btn" style="flex:1; padding:15px; font-weight:700; font-size:1rem; border-radius:14px;">🛒 Add to Cart</button>
            <button id="buy-now" class="btn btn-secondary" style="flex:1; padding:15px; font-weight:700; font-size:1rem; border-radius:14px;">🛍️ Buy Now</button>
          </div>
        </article>
      </section>

      <!-- Related Curated Products -->
      <section class="section-title" style="margin-top:64px;"><h2>Related Curated Products</h2></section>
      <section class="grid product-grid">
        ${related.items
          .filter(item => item._id !== product._id)
          .slice(0, 4)
          .map(
            item => {
              const itemFinalPrice = item.price * (1 - (item.discount || 0) / 100);
              const inWishlist = getWishlistItems().some(w => w._id === item._id);
              return `
              <article class="product-card fade-in" style="display: flex; flex-direction: column;">
                <div class="product-card-image-wrap">
                  <img class="product-thumb" loading="lazy" decoding="async" src="${item.imageUrl || "/logo.svg"}" alt="${item.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
                  
                  <div class="quick-view-overlay">
                    <a class="btn quick-view-btn-glass" href="/product.html?id=${item._id}">View Details</a>
                  </div>
                  
                  <button class="wishlist-overlay-btn" data-wish="${item._id}" onclick="event.stopPropagation(); event.preventDefault(); toggleWishlistInDetail('${item._id}');">
                    ${inWishlist ? "❤️" : "🤍"}
                  </button>
                </div>
                <div class="product-meta" style="margin-top: 12px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
                  <div>
                    <span class="pill" style="font-size: 0.65rem; padding: 2px 8px; margin-bottom: 6px;">${item.category || "General"}</span>
                    <h3 style="margin: 4px 0 0; font-size: 0.95rem; min-height: 40px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${item.name}">${item.name}</h3>
                  </div>
                  <div style="margin-top: 10px;">
                    <div class="price-line" style="margin-bottom: 0; align-items: baseline;">
                      <span class="price" style="font-size: 1.15rem; font-weight: 800; color: var(--brand-2);">${formatPrice(itemFinalPrice)}</span>
                      <span class="rating" style="font-size: 0.85rem;">★ ${getRating(item)}</span>
                    </div>
                  </div>
                </div>
              </article>`;
            }
          )
          .join("")}
      </section>
    `;

    // Global helper for wishlist toggle inside related products
    window.toggleWishlistInDetail = function(id) {
      const items = related.items;
      const product = items.find(item => item._id === id);
      if (!product) return;
      const added = toggleWishlist(product);
      saveActivity({
        action: added ? "Added to wishlist" : "Removed from wishlist",
        productId: product._id,
        productName: product.name,
        source: "product-detail-related"
      });
      showToast(added ? "Added to wishlist" : "Removed from wishlist");
      // Trigger a light reload to sync heart status
      const btn = document.querySelector(`[data-wish="${id}"]`);
      if (btn) btn.innerHTML = added ? "❤️" : "🤍";
    };


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
