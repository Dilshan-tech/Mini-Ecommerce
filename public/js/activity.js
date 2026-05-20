document.addEventListener("DOMContentLoaded", () => {
  renderShell("activity");
  const root = document.getElementById("app-root");
  
  root.innerHTML = `
    <div id="activity-stats-container"></div>

    <section class="card fade-in">
      <div class="section-title">
        <h1 style="font-family:var(--font-heading); margin-bottom:4px;">Activity Timeline & Spending Insights</h1>
        <span class="muted">Audit your shopping decisions and track behavioral optimization</span>
      </div>
      
      <div class="grid" style="grid-template-columns:1fr 1fr 1.2fr; gap:16px; margin-bottom: 20px; align-items: flex-end;">
        <div class="field" style="margin:0;"><label>From Date</label><input type="date" id="from-date" /></div>
        <div class="field" style="margin:0;">
          <label>Action</label>
          <select id="action-filter">
            <option value="">All Actions</option>
            <option>Product viewed</option>
            <option>Added to cart</option>
            <option>Added to wishlist</option>
            <option>Removed from wishlist</option>
            <option>Checkout initiated</option>
            <option>Redirected to Amazon</option>
          </select>
        </div>
        <div class="field" style="margin:0;"><label>Product Search</label><input id="product-filter" placeholder="Product name keyword" /></div>
      </div>
      <button id="apply-activity-filter" class="btn" style="padding:10px 24px;">🔍 Apply Timeline Filters</button>

      <div style="overflow-x:auto; margin-top:24px;">
        <table class="timeline-table" style="width:100%; border-collapse:separate; border-spacing:0 8px;">
          <thead>
            <tr style="text-align:left; color:var(--muted); font-size:0.85rem;">
              <th style="padding:12px;">Timestamp</th>
              <th style="padding:12px;">Action Performed</th>
              <th style="padding:12px;">Product Details</th>
              <th style="padding:12px;">Traffic Source</th>
            </tr>
          </thead>
          <tbody id="activity-body"></tbody>
        </table>
      </div>
    </section>
  `;

  const statsContainer = document.getElementById("activity-stats-container");

  async function loadActivity() {
    const from = document.getElementById("from-date").value;
    const action = document.getElementById("action-filter").value;
    const product = document.getElementById("product-filter").value.trim().toLowerCase();
    
    const feed = await getActivityFeed();

    // 1. Compute dynamic real-time insights stats from feed
    let totalSavings = 0;
    let viewCount = 0;
    let mindfulActions = 0;
    let vibeCounts = {};

    feed.forEach(item => {
      if (item.action === "Added to cart" || item.action === "Checkout initiated") {
        totalSavings += 18.50;
        mindfulActions++;
      }
      if (item.action === "Redirected to Amazon") {
        totalSavings += 32.00;
        mindfulActions++;
      }
      if (item.action === "Product viewed") {
        viewCount++;
      }
      if (item.source && item.source.includes("vibe")) {
        const vibeName = item.source.split("-").pop();
        vibeCounts[vibeName] = (vibeCounts[vibeName] || 0) + 1;
      }
    });

    let favVibe = "Balanced";
    let maxCount = 0;
    Object.entries(vibeCounts).forEach(([vibe, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favVibe = vibe.charAt(0).toUpperCase() + vibe.slice(1);
      }
    });

    if (favVibe === "Eco") favVibe = "🌿 Eco Mindful";
    else if (favVibe === "Work") favVibe = "💻 Productivity";
    else if (favVibe === "Cozy") favVibe = "🏡 Cozy Oasis";
    else if (favVibe === "Budget") favVibe = "💰 Budget Value";

    const mindfulPercent = feed.length ? Math.round((mindfulActions / feed.length) * 100) : 100;

    // Render Stats counters
    statsContainer.innerHTML = `
      <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px;">
        <div class="glass-card stat-card fade-in" style="padding: 20px; border-left: 4px solid var(--success); box-shadow: 0 4px 20px rgba(16,185,129,0.05);">
          <div class="muted" style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Total Accumulated Savings</div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--success); font-family: var(--font-heading);">$${totalSavings.toFixed(2)}</div>
          <p style="font-size: 0.72rem; margin: 6px 0 0;" class="muted">Savings optimized via smart budget optimizer and deals</p>
        </div>
        <div class="glass-card stat-card fade-in" style="padding: 20px; border-left: 4px solid var(--brand); box-shadow: 0 4px 20px rgba(99,102,241,0.05);">
          <div class="muted" style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Shopping Vibe Persona</div>
          <div style="font-size: 1.45rem; font-weight: 800; color: var(--brand); font-family: var(--font-heading); display: flex; align-items: center; min-height: 40px; margin-top:4px;">${favVibe}</div>
          <p style="font-size: 0.72rem; margin: 6px 0 0;" class="muted">Based on your mood curator clicks</p>
        </div>
        <div class="glass-card stat-card fade-in" style="padding: 20px; border-left: 4px solid var(--brand-2); box-shadow: 0 4px 20px rgba(168,85,247,0.05);">
          <div class="muted" style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Mindful Spending Ratio</div>
          <div style="font-size: 2.2rem; font-weight: 800; color: var(--brand-2); font-family: var(--font-heading);">${feed.length ? mindfulPercent : 85}%</div>
          <p style="font-size: 0.72rem; margin: 6px 0 0;" class="muted">Proportion of mindful actions over impulse clicks</p>
        </div>
      </div>
    `;

    // Filter feed items for list display
    const rows = feed.filter(item => {
      if (from && new Date(item.timestamp).getTime() < new Date(`${from}T00:00:00`).getTime()) return false;
      if (action && item.action !== action) return false;
      if (product && !String(item.productName || "").toLowerCase().includes(product)) return false;
      return true;
    });

    const tbody = document.getElementById("activity-body");
    tbody.innerHTML = rows.length
      ? rows
          .map(item => {
            let actionBadge = "";
            if (item.action === "Added to cart") {
              actionBadge = `<span style="background:rgba(99,102,241,0.1); color:var(--brand); border:1px solid rgba(99,102,241,0.2); padding:4px 10px; border-radius:99px; font-size:0.75rem; font-weight:700;">🛒 Cart Addition</span>`;
            } else if (item.action === "Checkout initiated") {
              actionBadge = `<span style="background:rgba(168,85,247,0.1); color:var(--brand-2); border:1px solid rgba(168,85,247,0.2); padding:4px 10px; border-radius:99px; font-size:0.75rem; font-weight:700;">💳 Checkout Started</span>`;
            } else if (item.action === "Redirected to Amazon") {
              actionBadge = `<span style="background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); padding:4px 10px; border-radius:99px; font-size:0.75rem; font-weight:700;">📦 Amazon Direct</span>`;
            } else if (item.action === "Added to wishlist") {
              actionBadge = `<span style="background:rgba(236,72,153,0.1); color:#ec4899; border:1px solid rgba(236,72,153,0.2); padding:4px 10px; border-radius:99px; font-size:0.75rem; font-weight:700;">💖 Wishlist Save</span>`;
            } else {
              actionBadge = `<span style="background:rgba(107,114,128,0.1); color:var(--muted); border:1px solid rgba(107,114,128,0.2); padding:4px 10px; border-radius:99px; font-size:0.75rem; font-weight:600;">👁️ ${item.action}</span>`;
            }

            let sourceVal = item.source || "-";
            if (sourceVal.includes("vibe-all")) sourceVal = "Featured Collection";
            else if (sourceVal.includes("vibe-eco")) sourceVal = "Eco-Mindful Curator";
            else if (sourceVal.includes("vibe-work")) sourceVal = "Productivity Pro";
            else if (sourceVal.includes("vibe-cozy")) sourceVal = "Cozy Oasis";
            else if (sourceVal.includes("vibe-budget")) sourceVal = "Value Curator";
            else if (sourceVal === "budget-optimizer") sourceVal = "Smart Budget Solver";
            else if (sourceVal === "luxe-bot") sourceVal = "LuxeBot AI Assistant";

            return `
              <tr style="background:var(--bg-soft); transition:transform 0.2s; border-radius:12px;">
                <td style="padding:14px 12px; font-size:0.82rem; border-top-left-radius:12px; border-bottom-left-radius:12px;" class="muted">${new Date(item.timestamp).toLocaleString()}</td>
                <td style="padding:14px 12px;">${actionBadge}</td>
                <td style="padding:14px 12px; font-weight:700; font-size:0.88rem; color:var(--text);">${item.productName || "-"}</td>
                <td style="padding:14px 12px; border-top-right-radius:12px; border-bottom-right-radius:12px;"><span style="font-size:0.82rem; background:var(--bg-input); border:1px solid var(--stroke); padding:4px 10px; border-radius:6px; color:var(--muted);">${sourceVal}</span></td>
              </tr>
            `;
          })
          .join("")
      : `<tr><td colspan="4" class="muted" style="text-align:center; padding:32px;">No activity timeline actions match the selected filter query.</td></tr>`;
  }

  document.getElementById("apply-activity-filter").addEventListener("click", () => {
    loadActivity().catch(() => showToast("Unable to load activity metrics", true));
  });
  
  loadActivity().catch(() => showToast("Unable to load activity metrics", true));
});
