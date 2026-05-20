document.addEventListener("DOMContentLoaded", async () => {
  renderShell("home");
  const root = document.getElementById("app-root");
  const user = getCurrentUser();
  const cartItems = getCartItems();
  const wishlistItems = getWishlistItems();

  // 1. Personalized User Welcome & Stats Banner
  const greeting = user 
    ? `✨ Welcome back, <strong style="color:var(--brand);">${user.name}</strong>!` 
    : `✨ Welcome to LuxeCart! Enjoy secure checkout & curated luxury setups.`;
  
  const statsLine = user 
    ? `You have <strong style="color:var(--brand-2);">${cartItems.reduce((acc, i)=>acc+i.qty, 0)}</strong> item(s) in your cart and <strong style="color:var(--brand-2);">${wishlistItems.length}</strong> saved to wishlist.`
    : `<a href="/login.html" style="color:var(--brand); text-decoration:underline;">Login</a> to unlock personalized setups and order insights!`;

  root.innerHTML = `
    <!-- Personalized Header Card -->
    <div class="glass-card fade-in" style="margin-bottom:28px; padding:20px 24px; border-left:4px solid var(--brand); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div>
        <h2 style="margin:0 0 6px; font-size:1.25rem; font-family:var(--font-heading);">${greeting}</h2>
        <p class="muted" style="margin:0; font-size:0.9rem;">${statsLine}</p>
      </div>
      <div>
        <span class="pill" style="font-size:0.75rem; background:rgba(99,102,241,0.06); padding:6px 14px; font-weight:700;">🌐 Premium Member Vibe</span>
      </div>
    </div>

    <!-- Luxe Hero -->
    <section class="hero fade-in">
      <div>
        <h1>Luxury Tech. <span>Mindful Shopping.</span> Elite Conversions.</h1>
        <p>Discover curated accessories, trust-driven checkout models, and our signature budget optimization solver designed to curb impulse spending.</p>
        <div class="cta-group">
          <a class="btn" href="/products.html">Shop Collection</a>
          ${user ? `<a class="btn btn-secondary" href="/profile.html">Your Profile</a>` : `<a class="btn btn-secondary" href="/signup.html">Join Membership</a>`}
        </div>
      </div>
      <div class="glass-card">
        <h3 style="margin-top:0; font-family:var(--font-heading);">Limited-Time Vibe</h3>
        <p class="muted" style="font-size:0.9rem;">Premium picks with up to 30% launch discount integrated securely with Amazon.</p>
        <div class="offer"><span>Use checkout code</span><strong>LUXE30</strong></div>
      </div>
    </section>

    <!-- Interactive Budget Shopping Optimization Module -->
    <section class="budget-mode-card fade-in">
      <div class="budget-mode-header">
        <span style="font-size:1.6rem;">💰</span>
        <h3>Smart Budget Shopping Mode</h3>
      </div>
      <p class="muted" style="margin-top:0; font-size:0.88rem;">Specify your target budget, choose a product category, and let LuxeCart's optimization solver build the ultimate bundle of top-rated, highly-discounted products matching your price limit closely without going over!</p>
      <div class="grid" style="grid-template-columns:1.5fr 1fr 1.2fr; gap:16px; align-items:flex-end;">
        <div class="field" style="margin:0;">
          <label>Target Budget ($)</label>
          <input type="number" id="budget-input-val" placeholder="e.g. 500" value="400" min="20" />
        </div>
        <div class="field" style="margin:0;">
          <label>Category Focus</label>
          <select id="budget-category-val">
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Accessories">Accessories</option>
            <option value="Home">Home</option>
          </select>
        </div>
        <button id="optimize-budget-btn" class="btn" style="width:100%; height:44px; font-size:0.95rem;">🚀 Optimize My Budget</button>
      </div>
      <div id="budget-optimization-results" style="margin-top:20px; display:none;" class="fade-in">
        <h4 style="margin: 0 0 10px; font-weight:700; font-family:var(--font-heading);">✨ Custom Optimized Bundle (Fits Budget Perfectly)</h4>
        <div id="budget-bundle-list" class="budget-bundle-grid"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; background:var(--bg-soft); padding:16px; border-radius:12px; border:1px solid var(--stroke); flex-wrap:wrap; gap:12px;">
          <div>
            <div class="muted" style="font-size:0.85rem;">Total Bundle Value:</div>
            <strong style="font-size:1.35rem; color:var(--brand-2);" id="budget-bundle-total">$0.00</strong>
            <span style="font-size:0.85rem; color:var(--success); font-weight:bold; margin-left:10px;" id="budget-bundle-savings">(You save $0.00!)</span>
          </div>
          <button class="btn" id="add-bundle-cart" style="padding:12px 24px;">🛒 Add Whole Bundle to Cart</button>
        </div>
      </div>
    </section>

    <!-- Vibe/Intent Selector Section -->
    <section class="section-title">
      <h2>Curate Your Shopping Vibe</h2>
      <span class="muted">Set your mood to customize Match Scores and Story Cards</span>
    </section>
    <div class="glass-card fade-in" style="margin-bottom: 28px; padding:14px;">
      <div style="display:flex; justify-content:space-around; gap:8px; flex-wrap:wrap;" id="vibe-buttons">
        <button class="btn btn-secondary active" data-vibe="all">🌈 Show All</button>
        <button class="btn btn-secondary" data-vibe="work">💻 Productivity Pro</button>
        <button class="btn btn-secondary" data-vibe="cozy">🏡 Cozy Oasis</button>
        <button class="btn btn-secondary" data-vibe="eco">🌿 Mindful Eco</button>
        <button class="btn btn-secondary" data-vibe="budget">💰 Value Focus</button>
      </div>
    </div>

    <!-- Main Grid Section -->
    <section class="section-title"><h2 id="grid-header">Curated Collection</h2><a class="muted" href="/products.html">View All</a></section>
    <section id="trending-grid" class="grid product-grid"></section>
  `;

  const grid = document.getElementById("trending-grid");
  const budgetInput = document.getElementById("budget-input-val");
  const budgetCategory = document.getElementById("budget-category-val");
  const optimizeBtn = document.getElementById("optimize-budget-btn");
  const optimizationResults = document.getElementById("budget-optimization-results");
  const bundleList = document.getElementById("budget-bundle-list");
  const bundleTotal = document.getElementById("budget-bundle-total");
  const bundleSavings = document.getElementById("budget-bundle-savings");
  const addBundleBtn = document.getElementById("add-bundle-cart");
  const vibeButtons = document.querySelectorAll("#vibe-buttons button");
  const gridHeader = document.getElementById("grid-header");

  grid.innerHTML = new Array(4).fill('<div class="skeleton"></div>').join("");

  let allAvailableProducts = [];
  let currentActiveVibe = "all";
  let activeBundleItems = [];

  try {
    // Fetch all products so we can perform dynamic local filtering and budget solving
    const productData = await apiRequest(`${API_BASE}/products?limit=50&page=1`);
    allAvailableProducts = productData.items;

    // Render original items (trending & bestsellers) initially
    renderVibeGrid("all");

    // 2. Budget Optimizer Button Listener
    optimizeBtn.addEventListener("click", () => {
      const budget = Number(budgetInput.value) || 0;
      const cat = budgetCategory.value;

      if (budget <= 15) {
        showToast("Please enter a budget higher than $15.", true);
        return;
      }

      // Filter products by category
      let candidates = allAvailableProducts.filter(p => p.price > 0 && p.stock > 0);
      if (cat !== "All") {
        candidates = candidates.filter(p => p.category === cat);
      }

      if (candidates.length === 0) {
        showToast("No stock available in this category currently.", true);
        return;
      }

      // Simple Greedy Knapsack optimization:
      // Sort candidates by custom score: (trustScore + discount) / price
      candidates.sort((a, b) => {
        const scoreA = ((a.trustScore || 40) + (a.discount || 0)) / a.price;
        const scoreB = ((b.trustScore || 40) + (b.discount || 0)) / b.price;
        return scoreB - scoreA;
      });

      let currentSum = 0;
      const bundle = [];

      for (const item of candidates) {
        const itemPrice = item.price * (1 - (item.discount || 0) / 100);
        if (currentSum + itemPrice <= budget) {
          bundle.push(item);
          currentSum += itemPrice;
        }
      }

      if (bundle.length === 0) {
        // Fallback: take the absolute cheapest item in candidates
        const cheapest = candidates.reduce((min, p) => {
          const pPrice = p.price * (1 - (p.discount || 0) / 100);
          const minPrice = min.price * (1 - (min.discount || 0) / 100);
          return pPrice < minPrice ? p : min;
        }, candidates[0]);
        const cheapPrice = cheapest.price * (1 - (cheapest.discount || 0) / 100);
        if (cheapPrice <= budget) {
          bundle.push(cheapest);
          currentSum = cheapPrice;
        }
      }

      if (bundle.length === 0) {
        showToast("We couldn't fit any available products into this budget. Try raising it!", true);
        optimizationResults.style.display = "none";
        return;
      }

      activeBundleItems = bundle;
      showToast("Optimized bundle constructed successfully!");

      // Render bundle list
      bundleList.innerHTML = bundle.map(p => {
        const finalPrice = p.price * (1 - (p.discount || 0) / 100);
        return `
          <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:6px; background:var(--bg-soft); border-color:var(--brand-2);">
            <img src="${p.imageUrl || '/logo.svg'}" style="width:100%; height:90px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
            <div style="font-weight:700; font-size:0.85rem; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${p.name}">${p.name}</div>
            <div style="font-size:0.75rem;" class="pill">${p.category}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <span style="font-weight:800; color:var(--brand-2); font-size:0.9rem;">$${finalPrice.toFixed(2)}</span>
              ${p.discount ? `<span style="font-size:0.75rem; color:var(--danger); font-weight:700;">-${p.discount}%</span>` : ''}
            </div>
          </div>
        `;
      }).join("");

      const originalTotal = bundle.reduce((acc, p) => acc + p.price, 0);
      const totalSavings = originalTotal - currentSum;

      bundleTotal.textContent = `$${currentSum.toFixed(2)}`;
      bundleSavings.textContent = totalSavings > 0 
        ? `(You save $${totalSavings.toFixed(2)} today!)` 
        : "";

      optimizationResults.style.display = "block";
    });

    // Add Bundle to Cart
    addBundleBtn.addEventListener("click", () => {
      if (activeBundleItems.length === 0) return;
      activeBundleItems.forEach(item => {
        addToCart(item, 1);
        saveActivity({ action: "Added to cart", productId: item._id, productName: item.name, source: "budget-optimizer" });
      });
      showToast("Added entire budget bundle to cart!");
      // Open secure checkout modal simulating payments
      openCheckoutModal(activeBundleItems, "budget-optimizer-bundle");
    });

    // 3. Vibe Buttons Click Handler
    vibeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        vibeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentActiveVibe = btn.dataset.vibe;
        renderVibeGrid(currentActiveVibe);
      });
    });

    function renderVibeGrid(vibe) {
      grid.innerHTML = "";
      let items = [];
      let vibeTag = "";
      let vibeStyle = "";
      let vibeDesc = "";

      if (vibe === "all") {
        gridHeader.innerHTML = "Featured Collection";
        // Grab trending & bestsellers
        items = allAvailableProducts.filter(p => p.isTrending || p.isBestSeller).slice(0, 8);
      } else if (vibe === "work") {
        gridHeader.innerHTML = "💻 Productivity & Performance Vibe";
        items = allAvailableProducts.filter(p => p.category === "Electronics" || p.category === "Accessories").slice(0, 8);
        vibeTag = "💻 Vibe Match: 98% (Work Focused)";
        vibeStyle = "border-color:rgba(6,182,212,0.3); box-shadow:0 8px 24px rgba(6,182,212,0.06);";
        vibeDesc = "Engineered for maximum utility, crisp focus, and seamless flow.";
      } else if (vibe === "cozy") {
        gridHeader.innerHTML = "🏡 Cozy Oasis & Comfort Vibe";
        items = allAvailableProducts.filter(p => p.category === "Home" || p.category === "Accessories" || p.category === "Fashion").slice(0, 8);
        vibeTag = "🏡 Cozy Match: 95% (Warm Vibe)";
        vibeStyle = "border-color:rgba(245,158,11,0.3); box-shadow:0 8px 24px rgba(245,158,11,0.06);";
        vibeDesc = "Designed to bring warmth, soft lighting, and tranquility to your space.";
      } else if (vibe === "eco") {
        gridHeader.innerHTML = "🌿 Eco-Mindful & Sustainability Vibe";
        items = allAvailableProducts.filter(p => p.category === "Accessories" || p.category === "Home" || p.category === "Fashion").slice(0, 8);
        vibeTag = "🌿 Eco Score: A+ (Highly Mindful)";
        vibeStyle = "border-color:rgba(16,185,129,0.3); box-shadow:0 8px 24px rgba(16,185,129,0.06);";
        vibeDesc = "Responsibly sourced, built to endure, replacing disposable plastics.";
      } else if (vibe === "budget") {
        gridHeader.innerHTML = "💰 Value-Focused & Smart Buying Vibe";
        items = allAvailableProducts.filter(p => p.discount > 0 || p.price < 150).slice(0, 8);
        vibeTag = "💰 Smart Spend Vibe";
        vibeStyle = "border-color:rgba(239,68,68,0.25); box-shadow:0 8px 24px rgba(239,68,68,0.05);";
        vibeDesc = "Maximum launch discounts, smart savings, and minimal impulse friction.";
      }

      if (items.length === 0) {
        grid.innerHTML = `<div class="card"><p class="muted">No products found matching this vibe today.</p></div>`;
        return;
      }

      grid.innerHTML = items.map(product => {
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        const savings = product.price * (product.discount || 0) / 100;
        const isHighTrust = product.trustScore >= 50;
        const ecoVal = vibe === "eco" ? "A+" : (product.price > 500 ? "B" : "A");

        return `
          <article class="product-card fade-in" style="${vibeStyle}">
            <img class="product-thumb" loading="lazy" decoding="async" src="${product.imageUrl || "/logo.svg"}" alt="${product.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';" />
            
            <div class="product-meta">
              <div class="badge-row">
                ${vibeTag ? `<span class="badge" style="background:var(--bg); border-color:var(--brand); font-weight:700;">${vibeTag}</span>` : ""}
                ${product.discount ? `<span class="badge" style="background:var(--danger); color:white; border-color:transparent;">-${product.discount}% OFF</span>` : ""}
                <span class="eco-label" title="Sustainability Rating">🌿 Eco: ${ecoVal}</span>
              </div>
              
              <h3>${product.name}</h3>
              
              <!-- Smart Mindful Storytelling Snippet -->
              <p class="muted" style="font-size:0.8rem; line-height:1.4; margin:4px 0 8px;">
                ${vibeDesc ? vibeDesc : "Premium craftsmanship designed to blend seamlessly into modern spaces."}
              </p>
              
              <div style="background:var(--bg-soft); padding:10px; border-radius:10px; border:1px solid var(--stroke); margin-top:auto;">
                <div class="price-line" style="margin-bottom:0;">
                  <span class="price">$${finalPrice.toFixed(2)}</span>
                  <span class="rating">★ ${getRating(product)}</span>
                </div>
                ${product.discount ? `
                  <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:4px;">
                    <span class="muted">Original: <s>$${product.price.toFixed(2)}</s></span>
                    <span style="color:var(--success); font-weight:bold;">You Save: $${savings.toFixed(2)}</span>
                  </div>
                ` : ""}
              </div>

              <!-- Need vs Want Purchase Mindful Slider Indicator -->
              <div class="need-slider-wrap">
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600;" class="muted">
                  <span>Need index: ${product.price < 150 ? '90%' : '35%'}</span>
                  <span>Want index: ${product.price < 150 ? '10%' : '65%'}</span>
                </div>
                <div class="need-bar">
                  <div class="need-bar-fill" style="width: ${product.price < 150 ? '90%' : '35%'};"></div>
                </div>
              </div>

              <div class="actions" style="margin-top:14px;">
                <a href="/product.html?id=${product._id}" class="btn btn-secondary" style="flex:1;">View Detail</a>
                <button data-add="${product._id}" class="btn" style="flex:1;">Add To Cart</button>
              </div>
            </div>
          </article>
        `;
      }).join("");

      // Bind dynamic cart events
      grid.querySelectorAll("[data-add]").forEach(button => {
        button.addEventListener("click", () => {
          const product = allAvailableProducts.find(item => item._id === button.dataset.add);
          if (!product) return;
          addToCart(product, 1);
          saveActivity({ action: "Added to cart", productId: product._id, productName: product.name, source: `home-vibe-${vibe}` });
          showToast("Added to cart");
          openCheckoutModal([product], `home-vibe-${vibe}`);
        });
      });
    }

  } catch (error) {
    grid.innerHTML = `<div class="card"><p class="muted">Unable to load features. Please check your DB connection.</p></div>`;
  }
});
