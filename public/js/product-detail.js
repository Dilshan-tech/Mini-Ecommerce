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
      <section class="product-detail">
        <article class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <img id="main-image" class="gallery-main" loading="lazy" decoding="async" src="${images[0]}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" style="border-radius:16px; border:1px solid var(--stroke);" />
            <div class="thumb-row" style="margin-top:12px;">
              ${images.map(src => `<img loading="lazy" decoding="async" src="${src}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" style="border-radius:8px; border:1px solid var(--stroke);" />`).join("")}
            </div>
          </div>
        </article>
        <article class="card" style="padding:28px; border-radius:18px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
            <span class="pill" style="font-weight:700;">${product.category}</span>
            <div class="badge-row">
              ${product.discount ? `<span class="badge" style="background:#e74c3c;">-${product.discount}% OFF</span>` : ""}
              ${isHighTrust ? `<span class="badge" style="background:#2ecc71; color:#000;">🛡️ High Trust</span>` : ""}
              ${isPopular && !isHighTrust ? `<span class="badge" style="background:#f39c12; color:#000;">🔥 Popular</span>` : ""}
              ${isLimited ? `<span class="badge" style="background:#e67e22; color:#fff;">⏳ Limited Stock</span>` : ""}
            </div>
          </div>
          <h1 style="margin-top:14px; font-family:var(--font-heading); line-height:1.2; font-size:2rem;">${product.name}</h1>
          <p class="muted" style="line-height:1.5; margin-bottom:16px;">${product.description || "No description provided."}</p>
          
          <!-- Premium Sustainable Storytelling Details Box -->
          <div class="story-card" style="margin-bottom:20px; font-size:0.85rem; padding:12px 16px;">
            <strong>✨ Mindful Design Note:</strong> ${storyText}
          </div>

          <div style="background:var(--bg-soft); padding:16px; border-radius:12px; margin:16px 0; border:1px solid var(--stroke);">
            <div class="price-line" style="margin-bottom:0; display:flex; justify-content:space-between; align-items:center;">
              <span class="price" style="font-size:2.2rem; font-weight:800; color:var(--brand-2);">$${finalPrice.toFixed(2)}</span>
              <span class="rating" style="font-size:0.95rem; font-weight:700;">★ ${getRating(product)} · ${Math.max(6, Number(product.stock || 0) + 4)} verified reviews</span>
            </div>
            ${product.discount ? `
              <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:8px;" class="muted">
                <span>Original Price: <s>$${product.price.toFixed(2)}</s></span>
                <span style="color:#2ecc71; font-weight:bold;">Instant Launch Discount Savings: $${savings.toFixed(2)}</span>
              </div>
            ` : ""}
          </div>
          
          <!-- Need vs Want Index Detail Slider -->
          <div class="need-slider-wrap" style="margin-bottom:20px; padding:12px 14px;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700;" class="muted">
              <span>Need index: ${needIndexVal} (Utility Match)</span>
              <span>Want index: ${wantIndexVal} (Impulse Rating)</span>
            </div>
            <div class="need-bar" style="margin-top:8px; height:6px;">
              <div class="need-bar-fill" style="width: ${needIndexVal};"></div>
            </div>
            <p class="muted" style="font-size:0.7rem; margin:6px 0 0; line-height:1.3;">Guided recommendation calculates utility score based on catalog category and item price metrics.</p>
          </div>

          <!-- Eco Rating Certification Line -->
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; padding:12px; border:1px solid var(--stroke); border-radius:12px; background:var(--bg-soft);">
            <span class="eco-label" style="font-size:0.85rem; padding:6px 12px;">🌿 Eco Rating: ${ecoVal}</span>
            <span class="muted" style="font-size:0.78rem; line-height:1.3;">Certified climate conscious shipping and carbon neutral supply chain compliance.</span>
          </div>

          <p class="${product.stock > 0 ? "muted" : "status-delete"}" style="font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:6px; margin-bottom:16px;">
            ${product.stock > 0 ? '🟢 In stock - ready to ship' : '🔴 Currently out of stock'}
          </p>
          
          <div class="actions" style="margin-top:16px; gap:12px;">
            <button id="add-cart" class="btn" style="flex:1; padding:14px; font-weight:700;">🛒 Add to Cart</button>
            <button id="buy-now" class="btn btn-secondary" style="flex:1; padding:14px; font-weight:700;">🛍️ Buy Now</button>
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
