document.addEventListener("DOMContentLoaded", async () => {
  renderShell("profile");
  const root = document.getElementById("app-root");
  root.innerHTML = `
    <section class="grid" style="grid-template-columns:1fr 1fr;gap:16px;">
      <article class="card" id="profile-data"></article>
      <article class="card">
        <h2>Profile Settings</h2>
        <form id="profile-form" enctype="multipart/form-data">
          <div class="field"><label>Name</label><input type="text" name="name" /></div>
          <div class="field"><label>Update Avatar</label><input type="file" name="avatar" accept="image/*" /></div>
          <button type="submit">Save Changes</button>
        </form>
        <button id="logout-btn" class="btn btn-danger" style="margin-top:12px;">Logout</button>
      </article>
    </section>
  `;

  const profileCard = document.getElementById("profile-data");
  const form = document.getElementById("profile-form");

  toggleSpinner(true);
  try {
    const user = await apiRequest(`${API_BASE}/users/me`);
    localStorage.setItem("user", JSON.stringify(user));
    profileCard.innerHTML = `
      <img src="${user.avatarUrl || "/logo.svg"}" alt="${user.name}" class="avatar" />
      <h3>${user.name}</h3>
      <p>${user.email}</p>
      <p class="pill">${user.role}</p>
    `;
  } catch (_error) {
    showToast("Please login to view profile", true);
    window.location.href = "/login.html";
  } finally {
    toggleSpinner(false);
  }

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(form);
    toggleSpinner(true);
    try {
      const result = await apiRequest(`${API_BASE}/users/me`, {
        method: "PUT",
        body: formData
      });
      localStorage.setItem("user", JSON.stringify(result.user));
      showToast("Profile updated");
      window.location.reload();
    } catch (error) {
      showToast(error.message, true);
    } finally {
      toggleSpinner(false);
    }
  });

  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
      await apiRequest(`${API_BASE}/auth/logout`, { method: "POST" });
    } catch (_error) {
      // Ignore API logout failure and clear local session anyway.
    }
    clearAuthData();
    window.location.href = "/login.html";
  });
});
