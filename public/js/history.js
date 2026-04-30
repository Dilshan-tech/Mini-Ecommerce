document.addEventListener("DOMContentLoaded", async () => {
  renderShell("history");
  const root = document.getElementById("app-root");
  root.innerHTML = `
    <section class="card">
      <div class="section-title"><h1>Action History</h1><span class="muted">Admin analytics panel</span></div>
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div class="field"><label>From Date</label><input type="date" id="from-date" /></div>
        <div class="field"><label>To Date</label><input type="date" id="to-date" /></div>
        <div class="field"><label>Action Type</label><select id="action-filter"><option value="">All</option><option value="CREATE">Create</option><option value="UPDATE">Update</option><option value="DELETE">Delete</option></select></div>
      </div>
      <button id="apply-history-filter">Apply</button>
      <div style="overflow:auto;margin-top:16px;">
        <table class="timeline-table">
          <thead><tr><th>Time</th><th>Action</th><th>Product</th><th>User</th><th>Details</th></tr></thead>
          <tbody id="history-body"></tbody>
        </table>
      </div>
    </section>
  `;

  async function loadHistory() {
    try {
      const user = getCurrentUser();
      if (!user || user.role !== "admin") {
        root.innerHTML = `<section class="card"><h2>Access denied</h2><p class="muted">Only admins can view history logs.</p></section>`;
        return;
      }

      const data = await apiRequest(`${API_BASE}/products/audit/logs?limit=200`);
      const action = document.getElementById("action-filter").value;
      const from = document.getElementById("from-date").value;
      const to = document.getElementById("to-date").value;

      const rows = data.items.filter(item => {
        if (action && item.action !== action) return false;
        const time = new Date(item.timestamp).getTime();
        if (from && time < new Date(`${from}T00:00:00`).getTime()) return false;
        if (to && time > new Date(`${to}T23:59:59`).getTime()) return false;
        return true;
      });

      const tbody = document.getElementById("history-body");
      tbody.innerHTML = rows.length
        ? rows
            .map(
              item => `<tr>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td class="status-${item.action.toLowerCase()}">${item.action}</td>
                <td>${item.productName || "-"}</td>
                <td>${item.userEmail || "-"}</td>
                <td><span class="muted">${Object.keys(item.changes || {}).join(", ") || "-"}</span></td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="5" class="muted">No records found for selected filters.</td></tr>`;
    } catch (error) {
      showToast(error.message, true);
    }
  }

  document.getElementById("apply-history-filter").addEventListener("click", loadHistory);
  loadHistory();
});
