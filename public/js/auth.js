document.addEventListener("DOMContentLoaded", () => {
  const page = window.location.pathname.toLowerCase();
  renderShell(page.includes("signup") ? "signup" : "login");
  const root = document.getElementById("app-root");
  const isSignup = page.includes("signup");

  root.innerHTML = isSignup
    ? `
      <section class="card" style="max-width:560px;margin:0 auto;">
        <h1>Create Your Premium Account</h1>
        <p class="muted">Join LuxeCart to unlock faster checkout and personalized recommendations.</p>
        <form id="signup-form" enctype="multipart/form-data">
          <div class="field"><label>Name</label><input type="text" name="name" required /></div>
          <div class="field"><label>Email</label><input type="email" name="email" required /></div>
          <div class="field"><label>Password</label><input type="password" name="password" required /></div>
          <div class="field"><label>Confirm Password</label><input type="password" name="confirmPassword" required /></div>
          <div class="field"><label>Profile Picture</label><input type="file" name="avatar" accept="image/*" /></div>
          <button type="submit">Create Account</button>
        </form>
        <p style="margin-top:16px;text-align:center;">Already have an account? <a href="/login.html" style="color:var(--brand);text-decoration:underline;">Login here</a></p>
      </section>`
    : `
      <section class="card" style="max-width:560px;margin:0 auto;">
        <h1>Welcome Back</h1>
        <p class="muted">Login to continue your premium shopping journey.</p>
        <form id="login-form">
          <div class="field"><label>Email</label><input type="email" name="email" required /></div>
          <div class="field"><label>Password</label><input type="password" name="password" required /></div>
          <button type="submit">Login</button>
        </form>
        <div style="margin-top:16px;text-align:center;">
          <a href="/api/auth/google" class="btn btn-secondary" style="display:inline-block;margin-bottom:12px;">Continue with Google</a>
          <p>Don't have an account? <a href="/signup.html" style="color:var(--brand);text-decoration:underline;">Sign up here</a></p>
        </div>
      </section>`;

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  if (signupForm) {
    signupForm.addEventListener("submit", async event => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const password = formData.get("password");
      const confirmPassword = formData.get("confirmPassword");

      if (password !== confirmPassword) {
        showToast("Passwords do not match", true);
        return;
      }

      toggleSpinner(true);
      try {
        const result = await apiRequest(`${API_BASE}/auth/signup`, {
          method: "POST",
          body: formData
        });
        setAuthData(result);
        showToast("Signup successful");
        window.location.href = "/profile.html";
      } catch (error) {
        showToast(error.message, true);
      } finally {
        toggleSpinner(false);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async event => {
      event.preventDefault();
      const payload = {
        email: loginForm.email.value.trim(),
        password: loginForm.password.value
      };

      toggleSpinner(true);
      try {
        const result = await apiRequest(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setAuthData(result);
        showToast("Login successful");
        window.location.href = "/profile.html";
      } catch (error) {
        showToast(error.message, true);
      } finally {
        toggleSpinner(false);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await apiRequest(`${API_BASE}/auth/logout`, { method: "POST" });
      clearAuthData();
      window.location.href = "/login.html";
    });
  }
});
