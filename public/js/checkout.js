document.addEventListener("DOMContentLoaded", () => {
  renderShell("checkout");
  const root = document.getElementById("app-root");
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;

  root.innerHTML = `
    <section class="card">
      <div class="stepper">
        <div class="step active">Address</div>
        <div class="step">Payment</div>
        <div class="step">Review</div>
      </div>
      <div class="cart-layout">
        <article class="card">
          <h2>Checkout</h2>
          <div class="field"><label>Full Name</label><input id="full-name" required /></div>
          <div class="field"><label>Address</label><input id="address" required /></div>
          <div class="field"><label>City</label><input id="city" required /></div>
          <div class="field"><label>Postal Code</label><input id="zip" required /></div>
          <div class="field"><label>Card Number</label><input id="card" placeholder="**** **** **** 1234" required /></div>
          <div class="payment-tabs">
            <button type="button" class="btn btn-secondary active">UPI</button>
            <button type="button" class="btn btn-secondary">Card</button>
            <button type="button" class="btn btn-secondary">Net Banking</button>
          </div>
          <button id="place-order">Proceed to Pay</button>
        </article>
        <article class="card">
          <h3>Order Summary</h3>
          ${items.map(item => `<p class="price-line"><span>${item.name} x${item.qty}</span><strong>$${(item.price * item.qty).toFixed(2)}</strong></p>`).join("")}
          <hr style="border-color:rgba(184,201,255,0.2);" />
          <p class="price-line"><span>Subtotal</span><strong>$${subtotal.toFixed(2)}</strong></p>
          <p class="price-line"><span>Shipping</span><strong>${shipping ? `$${shipping.toFixed(2)}` : "Free"}</strong></p>
          <p class="price-line"><span>Total</span><strong>$${total.toFixed(2)}</strong></p>
        </article>
      </div>
    </section>
  `;

  document.getElementById("place-order").addEventListener("click", () => {
    if (!items.length) {
      showToast("Your cart is empty", true);
      return;
    }
    saveActivity({ action: "Checkout initiated", productId: "bundle", productName: "Checkout bundle", source: "checkout-page" });
    openCheckoutModal(items, "checkout-page").then(done => {
      if (!done) return;
      setCartItems([]);
      showToast("Redirected to Amazon");
      setTimeout(() => {
        window.location.href = "/activity.html";
      }, 700);
    });
  });
});
