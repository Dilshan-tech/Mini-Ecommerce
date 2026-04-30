document.addEventListener("DOMContentLoaded", () => {
  renderShell("wishlist");
  const root = document.getElementById("app-root");
  const items = getWishlistItems();

  if (!items.length) {
    root.innerHTML = `<section class="card"><h2>Your wishlist is empty</h2><p class="muted">Save favorites to revisit them quickly.</p><a class="btn" href="/products.html">Explore Products</a></section>`;
    return;
  }

  root.innerHTML = `
    <section class="section-title"><h2>Your Wishlist</h2><span class="muted">${items.length} saved items</span></section>
    <section class="grid product-grid">
      ${items
        .map(
          item => `<article class="product-card">
            <img class="product-thumb" src="${item.imageUrl || "/logo.svg"}" alt="${item.name}" />
            <div class="product-meta">
              <h3>${item.name}</h3>
              <div class="price-line"><span class="price">$${item.price}</span><span class="rating">★ ${getRating(item)}</span></div>
              <div class="actions">
                <a href="/product.html?id=${item._id}" class="btn btn-secondary">View</a>
                <button data-cart="${item._id}" class="btn">Add to Cart</button>
              </div>
            </div>
          </article>`
        )
        .join("")}
    </section>
  `;

  root.querySelectorAll("[data-cart]").forEach(button => {
    button.addEventListener("click", () => {
      const product = items.find(item => item._id === button.dataset.cart);
      addToCart(product, 1);
      saveActivity({ action: "Added to cart", productId: product._id, productName: product.name, source: "wishlist" });
      showToast("Moved to cart");
      openCheckoutModal([product], "wishlist-add-to-cart");
    });
  });
});
