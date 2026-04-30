document.addEventListener("DOMContentLoaded", () => {
  renderShell("activity");
  const root = document.getElementById("app-root");
  root.innerHTML = `
    <section class="card">
      <div class="section-title"><h1>Activity Timeline</h1><span class="muted">Your recent shopping actions</span></div>
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div class="field"><label>From Date</label><input type="date" id="from-date" /></div>
        <div class="field"><label>Action</label><select id="action-filter"><option value="">All</option><option>Product viewed</option><option>Added to cart</option><option>Added to wishlist</option><option>Removed from wishlist</option><option>Checkout initiated</option><option>Redirected to Amazon</option></select></div>
        <div class="field"><label>Product</label><input id="product-filter" placeholder="Filter by product name" /></div>
      </div>
      <button id="apply-activity-filter">Apply</button>
      <div style="overflow:auto;margin-top:16px;">
        <table class="timeline-table">
          <thead><tr><th>Time</th><th>Action</th><th>Product</th><th>Source</th></tr></thead>
          <tbody id="activity-body"></tbody>
        </table>
      </div>
    </section>
  `;

  async function loadActivity() {
    const from = document.getElementById("from-date").value;
    const action = document.getElementById("action-filter").value;
    const product = document.getElementById("product-filter").value.trim().toLowerCase();
    const feed = await getActivityFeed();
    const rows = feed.filter(item => {
      if (from && new Date(item.timestamp).getTime() < new Date(`${from}T00:00:00`).getTime()) return false;
      if (action && item.action !== action) return false;
      if (product && !String(item.productName || "").toLowerCase().includes(product)) return false;
      return true;
    });
    const tbody = document.getElementById("activity-body");
    tbody.innerHTML = rows.length
      ? rows
          .map(
            item => `<tr>
              <td>${new Date(item.timestamp).toLocaleString()}</td>
              <td>${item.action}</td>
              <td>${item.productName || "-"}</td>
              <td><span class="muted">${item.source || "-"}</span></td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="4" class="muted">No activity found for selected filters.</td></tr>`;
  }

  document.getElementById("apply-activity-filter").addEventListener("click", () => {
    loadActivity().catch(() => showToast("Unable to load activity", true));
  });
  loadActivity().catch(() => showToast("Unable to load activity", true));
});
