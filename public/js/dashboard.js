document.addEventListener("DOMContentLoaded", async () => {
  renderShell("home");
  const root = document.getElementById("app-root");
  root.innerHTML = `
    <section class="hero fade-in">
      <div>
        <h1>Luxury Tech. Seamless Shopping. Premium Conversions.</h1>
        <p>Discover curated products, trust-driven checkout, and high-performance ecommerce UX inspired by world-class retail platforms.</p>
        <div class="cta-group">
          <a class="btn" href="/products.html">Shop Collection</a>
          <a class="btn btn-secondary" href="/signup.html">Join Membership</a>
        </div>
      </div>
      <div class="glass-card">
        <h3>Limited-Time Offer</h3>
        <p class="muted">Premium picks with up to 30% launch discount.</p>
        <div class="offer"><span>Use code</span><strong>LUXE30</strong></div>
      </div>
    </section>
    <section class="banner-grid">
      <div class="glass-card"><h3>Free Express Delivery</h3><p class="muted">On all orders above $99</p></div>
      <div class="glass-card"><h3>Secure Payment</h3><p class="muted">256-bit encrypted checkout</p></div>
      <div class="glass-card"><h3>30-Day Returns</h3><p class="muted">Hassle-free returns policy</p></div>
    </section>
    <section class="section-title"><h2>Trending Products</h2><a class="muted" href="/products.html">View All</a></section>
    <section id="trending-grid" class="grid product-grid"></section>
    <section class="section-title"><h2>Best Sellers</h2><a class="muted" href="/products.html">Explore</a></section>
    <section id="bestseller-grid" class="grid product-grid"></section>
  `;

  const grid = document.getElementById("trending-grid");
  const bestGrid = document.getElementById("bestseller-grid");
  grid.innerHTML = new Array(4).fill('<div class="skeleton"></div>').join("");
  bestGrid.innerHTML = new Array(4).fill('<div class="skeleton"></div>').join("");
  try {
    const productData = await apiRequest(`${API_BASE}/products?limit=8&page=1`);
    const trending = productData.items.filter(item => item.isTrending).slice(0, 4);
    const bestSeller = productData.items.filter(item => item.isBestSeller).slice(0, 4);
    const renderCards = items =>
      items
      .map(product => {
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        const savings = product.price * (product.discount || 0) / 100;
        const isHighTrust = product.trustScore >= 50;
        const isPopular = product.isTrending || product.isBestSeller;
        
        return `
      <article class="product-card fade-in">
        <img class="product-thumb" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
        <div class="product-meta">
          <div class="badge-row">
            ${product.discount ? `<span class="badge" style="background:#e74c3c;">-${product.discount}% OFF</span>` : ""}
            ${isHighTrust ? `<span class="badge" style="background:#2ecc71; color:#000;">🛡️ High Trust</span>` : ""}
            ${isPopular && !isHighTrust ? `<span class="badge" style="background:#f39c12; color:#000;">🔥 Popular</span>` : ""}
            ${product.category ? `<span class="badge">${product.category}</span>` : ""}
          </div>
          <h3>${product.name}</h3>
          
          <div style="background:var(--bg-input); padding:8px; border-radius:4px; margin:12px 0;">
            <div class="price-line" style="margin-bottom:0;">
              <span class="price">$${finalPrice.toFixed(2)}</span>
              <span class="rating">★ ${getRating(product)}</span>
            </div>
            ${product.discount ? `
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:4px;">
                <span class="muted">Original: <s>$${product.price.toFixed(2)}</s></span>
                <span style="color:#2ecc71; font-weight:bold;">You Save: $${savings.toFixed(2)}</span>
              </div>
            ` : ""}
          </div>

          <div class="actions">
            <a href="/product.html?id=${product._id}" class="btn btn-secondary">View</a>
            <button data-add="${product._id}" class="btn">Add to Cart</button>
          </div>
        </div>
      </article>`;
      })
      .join("");
    grid.innerHTML = renderCards(trending);
    bestGrid.innerHTML = renderCards(bestSeller);

    document.querySelectorAll("[data-add]").forEach(button => {
      button.addEventListener("click", () => {
        const product = productData.items.find(item => item._id === button.dataset.add);
        addToCart(product, 1);
        saveActivity({ action: "Added to cart", productId: product._id, productName: product.name, source: "home" });
        showToast("Added to cart");
        openCheckoutModal([product], "home-add-to-cart");
      });
    });
  } catch (_error) {
    grid.innerHTML = `<div class="card"><p>Unable to load trending products.</p></div>`;
    bestGrid.innerHTML = `<div class="card"><p>Unable to load best sellers.</p></div>`;
  }
});
