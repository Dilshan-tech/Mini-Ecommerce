function renderCart() {
  const items = getCartItems();
  const root = document.getElementById("app-root");
  if (!items.length) {
    root.innerHTML = `<section class="card"><h2>Your cart is empty</h2><p class="muted">Discover premium products and add your favorites.</p><a class="btn" href="/products.html">Continue Shopping</a></section>`;
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;

  root.innerHTML = `
    <section class="cart-layout">
      <article class="card">
        <h2>Shopping Cart</h2>
        <div class="grid">
          ${items
            .map(
              item => `<div class="card" style="padding:14px;">
                <div class="price-line">
                  <div>
                    <h3 style="margin:0;">${item.name}</h3>
                    <p class="muted">$${item.price} x ${item.qty}</p>
                  </div>
                  <img src="${item.imageUrl || "/logo.svg"}" alt="${item.name}" style="width:70px;height:70px;object-fit:cover;border-radius:10px;" />
                </div>
                <div class="actions">
                  <button data-minus="${item._id}" class="btn btn-secondary">-</button>
                  <button data-plus="${item._id}" class="btn btn-secondary">+</button>
                  <button data-remove="${item._id}" class="btn btn-danger">Remove</button>
                </div>
              </div>`
            )
            .join("")}
        </div>
      </article>
      <article class="card">
        <h3>Order Summary</h3>
        <p class="price-line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></p>
        <p class="price-line"><span>Shipping</span><strong>${shipping ? `$${shipping.toFixed(2)}` : "Free"}</strong></p>
        <hr style="border-color:rgba(184,201,255,0.2);" />
        <p class="price-line"><span>Total</span><strong>$${total.toFixed(2)}</strong></p>
        <button id="cart-checkout" class="btn">Proceed to Checkout</button>
      </article>
    </section>
  `;

  root.querySelectorAll("[data-plus]").forEach(btn => {
    btn.addEventListener("click", () => updateQty(btn.dataset.plus, 1));
  });
  root.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", () => updateQty(btn.dataset.minus, -1));
  });
  root.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeItem(btn.dataset.remove));
  });
  document.getElementById("cart-checkout").addEventListener("click", async () => {
    const latest = getCartItems();
    if (!latest.length) {
      showToast("Your cart is empty", true);
      return;
    }
    saveActivity({ action: "Checkout initiated", productId: "bundle", productName: "Cart bundle", source: "cart" });
    const complete = await openCheckoutModal(latest, "cart-checkout");
    if (complete) {
      setCartItems([]);
      showToast("Amazon tab opened for purchase");
      renderCart();
    }
  });
}

function updateQty(id, delta) {
  const items = getCartItems();
  const target = items.find(item => item._id === id);
  if (!target) return;
  target.qty = Math.max(1, target.qty + delta);
  setCartItems(items);
  renderCart();
}

function removeItem(id) {
  const next = getCartItems().filter(item => item._id !== id);
  setCartItems(next);
  renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderShell("cart");
  renderCart();
});
